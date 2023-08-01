import { LinkIcon } from "@chakra-ui/icons";
import {
  IconButton,
  IconButtonProps,
  Spinner,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { Game, Tag } from "@prisma/client";
import { useMemo } from "react";
import { api } from "../../../utils/api";

export type ToggleTagForGameButtonProps = {
  gameId: Game["id"];
  tagId: Tag["id"];
};

export default function ToggleTagForGameButton(
  props: ToggleTagForGameButtonProps
) {
  const { gameId, tagId } = props;
  const gameQuery = api.games.getById.useQuery({ id: gameId });
  const tagQuery = api.tags.getById.useQuery({ id: tagId });
  const updateGameMutation = api.games.updateById.useMutation();
  const utils = api.useContext();

  const toast = useToast();

  const hasTag = useMemo(() => {
    if (!gameQuery.data?.game.inputTags) return false;
    return gameQuery.data.game.inputTags.findIndex((t) => t.id === tagId) > -1;
  }, [gameQuery.data?.game?.inputTags, tagId]);

  const areQueriesFetching = useMemo(() => {
    return (
      gameQuery.isLoading ||
      gameQuery.isFetching ||
      tagQuery.isLoading ||
      tagQuery.isFetching
    );
  }, [
    gameQuery.isLoading,
    gameQuery.isFetching,
    tagQuery.isLoading,
    tagQuery.isFetching,
  ]);

  const handleClick = async () => {
    if (!gameQuery.data?.game) return;

    // Use the latest cached data for the game
    // This way, we can update the UI immediately and prevent tags from returning to previous states when rapidly clicking multiple of these toggles for different tags
    const latest = utils.games.getById.getData({ id: gameId });
    const updatedInputTags = hasTag
      ? (latest?.game.inputTags ?? gameQuery.data.game.inputTags).filter(
          (t) => t.id !== tagId
        ) // Remove tag
      : [
          ...(latest?.game.inputTags ?? gameQuery.data.game.inputTags),
          ...(tagQuery.data?.tag ? [tagQuery.data.tag] : []),
        ]; // Add tag

    toast.closeAll();
    const updateGameToast = toast({
      status: "loading",
      title: "Updating game...",
    });

    try {
      // Update the game in the cache before the mutation
      utils.games.getById.setData(
        {
          id: gameId,
        },
        {
          game: {
            ...(latest?.game ?? gameQuery.data?.game),
            inputTags: updatedInputTags.map((t) => ({
              ...t,
              gameObjects: [],
            })),
          },
        }
      );

      // Then update the game in the database
      await updateGameMutation.mutateAsync({
        id: gameId,
        data: { inputTags: updatedInputTags.map((t) => t.id) },
      });

      toast.update(updateGameToast, {
        status: "success",
        title: "Saved!",
      });
    } catch (error) {
      try {
        // Invalidate the game cache to prevent it from being out of sync with the database after an error
        await utils.games.getById.invalidate({ id: gameId });
      } catch (error) {
        console.error("Failed to invalidate game cache after error");
        console.error(error);
      }

      console.error(error);
      toast.update(updateGameToast, {
        title: `Error`,
        description: `Received an unexpected error when updating game id=${gameId}. See console for details.`,
        status: "error",
      });
    }
  };

  const isLoading = useMemo(() => {
    return areQueriesFetching;
  }, [areQueriesFetching]);

  const icon = useMemo(() => {
    if (isLoading) return <Spinner size="sm" />;
    return <LinkIcon />;
  }, [isLoading, hasTag]);

  const label = useMemo(() => {
    if (isLoading) return "Loading...";
    if (hasTag) return "Click to remove Input Tag";
    return "Click to apply Input Tag";
  }, [isLoading, hasTag]);

  const colorScheme: IconButtonProps["colorScheme"] = useMemo(() => {
    if (isLoading) return undefined;
    if (hasTag) return "red";
    return "green";
  }, [isLoading, hasTag]);

  return (
    <Tooltip label={label} placement="top">
      <IconButton
        icon={icon}
        aria-label={label}
        onClick={handleClick}
        colorScheme={colorScheme}
        size="sm"
        variant="outline"
        isDisabled={isLoading}
      />
    </Tooltip>
  );
}

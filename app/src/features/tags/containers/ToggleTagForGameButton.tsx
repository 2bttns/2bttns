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
  const toast = useToast();
  const gameQuery = api.games.getById.useQuery({ id: gameId });
  const tagQuery = api.tags.getById.useQuery({ id: tagId });
  const utils = api.useContext();

  const hasTag = useMemo(() => {
    if (!gameQuery.data?.game.inputTags) return false;
    return gameQuery.data.game.inputTags.findIndex((t) => t.id === tagId) > -1;
  }, [gameQuery.data?.game?.inputTags, tagId]);

  const updateGameMutation = api.games.updateById.useMutation({
    onMutate: async (next) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await utils.games.getById.cancel({ id: gameId });

      // Snapshot the previous value
      const previous = utils.games.getById.getData({ id: gameId });
      const updatedInputTags = hasTag
        ? previous?.game?.inputTags?.filter((t) => t.id !== tagId) // Remove tag
        : [
            ...(previous?.game?.inputTags ?? []),
            ...(tagQuery.data?.tag ? [tagQuery.data.tag] : []),
          ]; // Add tag

      // Optimistically update to the new value
      if (previous?.game) {
        utils.games.getById.setData(
          {
            id: gameId,
          },
          {
            game: {
              ...previous.game,
              inputTags:
                updatedInputTags?.map((t) => ({
                  ...t,
                  gameObjects: [],
                })) ?? [],
            },
          }
        );
      }

      // Return a context object with the snapshotted value
      return { previous };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, next, context) => {
      if (!context?.previous?.game) return;
      utils.games.getById.setData(
        {
          id: gameId,
        },
        {
          game: context?.previous?.game,
        }
      );
    },
    // Always refetch after error or success:
    onSettled: async () => {
      await utils.games.getById.refetch({ id: gameId });
    },
  });

  const areQueriesLoading = useMemo(() => {
    return gameQuery.isLoading || tagQuery.isLoading;
  }, [gameQuery.isLoading, tagQuery.isLoading]);

  const handleClick = async () => {
    if (!gameQuery.data?.game) return;

    toast.closeAll();
    const updateGameToast = toast({
      status: "loading",
      title: "Updating game...",
    });

    try {
      const previous = utils.games.getById.getData({ id: gameId });
      const updatedInputTags = hasTag
        ? previous?.game?.inputTags?.filter((t) => t.id !== tagId) // Remove tag
        : [
            ...(previous?.game?.inputTags ?? []),
            ...(tagQuery.data?.tag ? [tagQuery.data.tag] : []),
          ]; // Add tag

      await updateGameMutation.mutateAsync({
        id: gameId,
        data: { inputTags: updatedInputTags?.map((t) => t.id) ?? [] },
      });

      toast.update(updateGameToast, {
        status: "success",
        title: "Saved!",
      });
    } catch (error) {
      console.error(error);
      toast.update(updateGameToast, {
        title: `Error`,
        description: `Received an unexpected error when updating game id=${gameId}. See console for details.`,
        status: "error",
      });
    }
  };

  const isLoading = useMemo(() => {
    return areQueriesLoading;
  }, [areQueriesLoading]);

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

import { LinkIcon } from "@chakra-ui/icons";
import { ButtonProps, IconButton, Spinner, Tooltip } from "@chakra-ui/react";
import { GameObject, Tag } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../utils/api";

export type ToggleTagButtonProps = {
  tagId: Tag["id"];
  gameObjectId: GameObject["id"];
  loadingDelayMs?: number;
};

export default function ToggleTagButton(props: ToggleTagButtonProps) {
  const { tagId, gameObjectId, loadingDelayMs = 250 } = props;

  const utils = api.useContext();
  const getGameObjectQuery = api.gameObjects.getById.useQuery({
    id: gameObjectId,
    includeTags: true,
  });
  const isTagApplied = getGameObjectQuery.data?.gameObject?.tags.some(
    (tag) => tag.id === tagId
  );

  const updateTagMutation = api.tags.updateById.useMutation();
  const handleApplyTag = async () => {
    try {
      await updateTagMutation.mutateAsync({
        id: tagId,
        data: {
          addGameObjects: isTagApplied ? undefined : [gameObjectId],
          removeGameObjects: isTagApplied ? [gameObjectId] : undefined,
        },
      });
      await utils.gameObjects.invalidate();
    } catch (error) {
      window.alert("Error deleting game object\n See console for details");
      console.error(error);
    }
  };

  const areQueriesLoading = useMemo(() => {
    return getGameObjectQuery.isLoading || updateTagMutation.isLoading;
  }, [getGameObjectQuery.isLoading, updateTagMutation.isLoading]);

  const [isWaitingForLoadDelay, setIsWaitingForLoadDelay] = useState(false);
  useEffect(() => {
    if (isWaitingForLoadDelay) return;

    if (!areQueriesLoading) {
      setIsWaitingForLoadDelay(true);
      const timeout = setTimeout(() => {
        setIsWaitingForLoadDelay(false);
      }, loadingDelayMs);
      return () => clearTimeout(timeout);
    }
  }, [areQueriesLoading, loadingDelayMs]);

  const isLoading = useMemo(() => {
    return areQueriesLoading || isWaitingForLoadDelay;
  }, [areQueriesLoading, isWaitingForLoadDelay]);

  const label = useMemo(() => {
    if (isLoading) return undefined;
    if (isTagApplied) return "Remove tag";
    return "Apply tag";
  }, [isTagApplied, isLoading]);

  const ariaLabel = useMemo(() => {
    if (isLoading)
      return `Loading - Toggle tag id ${tagId} for game object with ID: ${gameObjectId}`;
    if (isTagApplied)
      return `Remove tag with ID: ${tagId} for game object with ID: ${gameObjectId}`;
    return `Apply tag with ID: ${tagId} for game object with ID: ${gameObjectId}`;
  }, [isTagApplied, isLoading, gameObjectId, tagId]);

  const colorScheme = useMemo<ButtonProps["colorScheme"]>(() => {
    if (isLoading) return "gray";
    if (isTagApplied) return "red";
    return "green";
  }, [isTagApplied, isLoading]);

  const icon = useMemo(() => {
    if (isLoading) return <Spinner size="sm" />;
    return <LinkIcon />;
  }, [isLoading]);

  return (
    <Tooltip label={label} placement="top">
      <IconButton
        transition="0.1s !important"
        colorScheme={colorScheme}
        onClick={handleApplyTag}
        icon={icon}
        aria-label={ariaLabel}
        size="sm"
        variant="outline"
      />
    </Tooltip>
  );
}

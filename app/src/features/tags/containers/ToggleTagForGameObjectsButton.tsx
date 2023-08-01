import { LinkIcon } from "@chakra-ui/icons";
import { ButtonProps, IconButton, Spinner, Tooltip } from "@chakra-ui/react";
import { GameObject, Tag } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import {
  useToggleTagForGameObjects,
  UseToggleTagForGameObjectsParams,
} from "../hooks/useToggleTagForGameObjects";

export type ToggleTagForGameObjectsButtonProps = {
  tagId: Tag["id"];
  gameObjectIds: GameObject["id"][];
  loadingDelayMs?: number;
  operation?: UseToggleTagForGameObjectsParams["operation"];
};

export default function ToggleTagForGameObjectsButton(
  props: ToggleTagForGameObjectsButtonProps
) {
  const { tagId, gameObjectIds, loadingDelayMs = 250, operation } = props;

  const {
    isTagAppliedToAll,
    handleApplyTag,
    areQueriesLoading,
    isApplyingChanges,
  } = useToggleTagForGameObjects({ tagId, gameObjectIds, operation });

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
    if (isApplyingChanges) return true;

    // Only show initial loading state when the operation is "toggle", which determines if we're applying or removing the tag based on selected game objects
    // This won't show  for "add" or "remove" operations, which won't need to wait since the operation is known
    return (
      operation === "toggle" && (areQueriesLoading || isWaitingForLoadDelay)
    );
  }, [isApplyingChanges, operation, areQueriesLoading, isWaitingForLoadDelay]);

  const label = useMemo(() => {
    if (gameObjectIds.length > 1) {
      if (isLoading) return `Loading`;
      if (operation === "add" || isTagAppliedToAll)
        return `Remove tag from all`;
      return `Apply tag to all`;
    }
    if (isLoading) return undefined;
    if (operation === "add" || isTagAppliedToAll) return "Remove tag";
    return "Apply tag";
  }, [gameObjectIds.length, isLoading, operation, isTagAppliedToAll]);

  const ariaLabel = useMemo(() => {
    if (isLoading) return `Loading`;
    if (isTagAppliedToAll) return `Remove tag with ID=${tagId}`;
    return `Apply tag with ID=${tagId}`;
  }, [isTagAppliedToAll, isLoading, tagId]);

  const colorScheme = useMemo<ButtonProps["colorScheme"]>(() => {
    if (isLoading) return "gray";
    if (isTagAppliedToAll) return "red";
    return "green";
  }, [isTagAppliedToAll, isLoading]);

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
        isDisabled={isLoading}
      />
    </Tooltip>
  );
}

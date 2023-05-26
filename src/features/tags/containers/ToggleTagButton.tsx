import { LinkIcon } from "@chakra-ui/icons";
import { ButtonProps, IconButton, Spinner, Tooltip } from "@chakra-ui/react";
import { GameObject, Tag } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { useToggleTagForGameObjects } from "../hooks/useToggleTagForGameObjects";

export type ToggleTagButtonProps = {
  tagId: Tag["id"];
  gameObjectIds: GameObject["id"][];
  loadingDelayMs?: number;
};

export default function ToggleTagButton(props: ToggleTagButtonProps) {
  const { tagId, gameObjectIds, loadingDelayMs = 250 } = props;

  const { isTagAppliedToAll, handleApplyTag, areQueriesLoading } =
    useToggleTagForGameObjects({ tagId, gameObjectIds });

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
    if (gameObjectIds.length > 1) {
      if (isLoading) return `Loading`;
      if (isTagAppliedToAll) return `Remove tag from all`;
      return `Apply tag to all`;
    }
    if (isLoading) return undefined;
    if (isTagAppliedToAll) return "Remove tag";
    return "Apply tag";
  }, [isTagAppliedToAll, isLoading]);

  const ariaLabel = useMemo(() => {
    if (isLoading) return `Loading`;
    if (isTagAppliedToAll) return `Remove tag with ID: ${tagId}`;
    return `Apply tag with ID: ${tagId}`;
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

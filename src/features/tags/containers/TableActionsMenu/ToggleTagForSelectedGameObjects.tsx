// Table Action Menu item for bulk tagging selected game objects when a general tag is known
// For example, when on a "Activities" tag's page, you can select multiple game objects and (un)tag them using this menu action

import { MenuItem } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { GameObjectData } from "../../../gameobjects/containers/GameObjectsTable";
import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import { useToggleTagForGameObjects } from "../../hooks/useToggleTagForGameObjects";

export type ToggleTagForSelectedGameObjectsProps = {
  context: TableActionMenuContext<GameObjectData>;
  tagId: Tag["id"];
};

export default function ToggleTagForSelectedGameObjects(
  props: ToggleTagForSelectedGameObjectsProps
) {
  const { context, tagId } = props;

  const toggleQuery = useToggleTagForGameObjects({
    gameObjectIds: context.selectedRows.map((row) => row.id),
    tagId,
  });

  const actionText = toggleQuery.isTagAppliedToAll
    ? "Remove Tag from"
    : "Apply Tag to";

  if (context.selectedRows.length === 0) {
    return null;
  }

  return (
    <>
      <MenuItem
        color={toggleQuery.isTagAppliedToAll ? "red.500" : "green.500"}
        isDisabled={context.selectedRows.length === 0}
        onClick={toggleQuery.handleApplyTag}
      >
        {actionText} Selected ({context.selectedRows.length})
      </MenuItem>
    </>
  );
}

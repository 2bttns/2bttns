import { MenuItem, useDisclosure } from "@chakra-ui/react";
import { GameObjectData } from "../../../../../gameobjects/containers/GameObjectsTable";
import { EditTagsForGameObjectsDrawer } from "../../../../../tags/containers/EditTagsForGameObjectsButtonDrawer";
import { TableActionMenuContext } from "./index";

//
//
//

export type TableActionsMenuItemBulkTagProps<T extends object> = {
  context: TableActionMenuContext<T>;
};
/**
 * Add this to the `actionItems` prop of a `TableActionMenu` to add bulk-tagging UI that can manage tags for multiple selected items
 *
 * Supported for Game Objects only
 *
 * TODO: Add support for Games
 */

export default function TableActionsMenuItemBulkTag(
  props: TableActionsMenuItemBulkTagProps<GameObjectData>
) {
  const { context } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <EditTagsForGameObjectsDrawer
        isOpen={isOpen}
        onClose={onClose}
        gameObjectIds={context.selectedRows.map((row) => row.id)}
      />
      <MenuItem onClick={onOpen} isDisabled={context.selectedRows.length === 0}>
        Bulk Tag ({context.selectedRows.length})
      </MenuItem>
    </>
  );
}

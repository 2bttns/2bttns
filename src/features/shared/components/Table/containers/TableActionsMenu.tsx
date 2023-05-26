import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { GameObjectData } from "../../../../gameobjects/containers/GameObjectsTable";
import { EditTagsForGameObjectsDrawer } from "../../../../tags/containers/EditTagsForGameObjectsButtonDrawer";
import { ConfirmAlert } from "../../ConfirmAlert";

export type TableActionMenuProps<T extends Object> = {
  selectedRows: T[];
  actionItems: (context: TableActionMenuContext<T>) => React.ReactNode;
};

export type TableActionMenuContext<T extends Object> = {
  selectedRows: TableActionMenuProps<T>["selectedRows"];
};

export default function TableActionMenu<T extends Object>(
  props: TableActionMenuProps<T>
) {
  const { selectedRows, actionItems } = props;
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
        Actions
      </MenuButton>
      <MenuList zIndex={99}>
        {actionItems({ selectedRows })}
        {/* <MenuItem>Tag</MenuItem>
        <MenuItem>Export CSV</MenuItem>
        {/* Update CsvImport function & export selected items */}
        {/* <MenuItem>Import CSV</MenuItem> */}
      </MenuList>
    </Menu>
  );
}

//
//
//

export type TableActionsMenuItemDeleteProps<T extends Object> = {
  context: TableActionMenuContext<T>;
  handleDelete: (
    selectedRows: TableActionMenuProps<T>["selectedRows"]
  ) => Promise<void>;
};

/**
 * Add this to the `actionItems` prop of a `TableActionMenu` to add a delete button for bulk-deleting selected items
 */
export function TableActionsMenuItemDelete<T extends Object>(
  props: TableActionsMenuItemDeleteProps<T>
) {
  const { context, handleDelete } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleConfirmDelete = async () => {
    try {
      await handleDelete(context.selectedRows);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <ConfirmAlert
        alertTitle={`Delete ${context.selectedRows.length} selected items?`}
        handleConfirm={handleConfirmDelete}
        isOpen={isOpen}
        onClose={onClose}
        performingConfirmActionText="Deleting..."
      >
        Are you sure? You can&apos;t undo this action afterwards.
      </ConfirmAlert>
      <MenuItem
        onClick={onOpen}
        color="red.500"
        isDisabled={context.selectedRows.length === 0}
      >
        Delete Selected ({context.selectedRows.length})
      </MenuItem>
    </>
  );
}

//
//
//

export type TableActionsMenuItemBulkTag<T extends Object> = {
  context: TableActionMenuContext<T>;
};

/**
 * Add this to the `actionItems` prop of a `TableActionMenu` to add bulk-tagging UI that can manage tags for multiple selected items
 *
 * Supported for Game Objects only
 *
 * TODO: Add support for Games
 */
export function TableActionsMenuItemBulkTag(
  props: TableActionsMenuItemBulkTag<GameObjectData>
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

import { MenuItem, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { ConfirmAlert } from "../../../ConfirmAlert";
import { TableActionMenuContext, TableActionMenuProps } from "./index";

export type TableActionsMenuItemDeleteProps<T extends Object> = {
  context: TableActionMenuContext<T>;
  handleDelete: (
    selectedRows: TableActionMenuProps<T>["selectedRows"]
  ) => Promise<void>;
};
/**
 * Add this to the `actionItems` prop of a `TableActionMenu` to add a delete button for bulk-deleting selected items
 */

export default function TableActionsMenuItemDelete<T extends Object>(
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

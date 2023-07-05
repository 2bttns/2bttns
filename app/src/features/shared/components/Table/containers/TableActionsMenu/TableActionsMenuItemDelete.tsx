import { MenuItem, useDisclosure } from "@chakra-ui/react";
import ConfirmAlert from "../../../ConfirmAlert";
import { TableActionMenuContext, TableActionMenuProps } from "./index";

export type TableActionsMenuItemDeleteProps<T extends object> = {
  context: TableActionMenuContext<T>;
  handleDelete: (
    selectedRows: TableActionMenuProps<T>["selectedRows"]
  ) => Promise<void>;

  // If "on-confirm", the menu will close after the user confirms the delete -- useful if the delete action is asynchronous / when using a toast to notify the user of success/error
  // If "after-success", the menu will close after the delete is successful -- useful if the delete action requires the prompt to stay open until the delete is successful
  closeMenuMode?: "on-confirm" | "after-success";
};
/**
 * Add this to the `actionItems` prop of a `TableActionMenu` to add a delete button for bulk-deleting selected items
 */

export default function TableActionsMenuItemDelete<T extends object>(
  props: TableActionsMenuItemDeleteProps<T>
) {
  const {
    context,
    handleDelete,
    closeMenuMode: closeMenuOnDelete = "after-success",
  } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleConfirmDelete = async () => {
    try {
      if (closeMenuOnDelete === "on-confirm") onClose();
      await handleDelete(context.selectedRows);
      if (closeMenuOnDelete === "after-success") onClose();
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

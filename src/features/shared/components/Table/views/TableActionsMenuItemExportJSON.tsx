import { MenuItem, useDisclosure } from "@chakra-ui/react";
import ConfirmAlert, { ConfirmAlertProps } from "../../ConfirmAlert";
import { TableActionMenuContext } from "../containers/TableActionsMenu/index";

export type JSONOutput = object | object[];

/**
 * Add this to the `actionItems` prop of a `TableActionMenu` to add JSON Export functionality
 * TODO: CSV Export
 */

export type TableActionsMenuItemExportJSONProps<
  T extends object,
  J extends JSONOutput = T[]
> = {
  context: TableActionMenuContext<T>;
  // JSON Output is an array of objects matching the context type (e.g. GameObjectData[]))
  // If a JSONOutput generic is provided, it will be used as the type for the JSON output instead
  fetchJSON: (context: TableActionMenuContext<T>) => Promise<J>;
  menuItemText?: (context: TableActionMenuContext<T>) => string;
  isDisabled?: (context: TableActionMenuContext<T>) => boolean;
  confirmationAlert?: {
    title?: ConfirmAlertProps["alertTitle"];
    body?: ConfirmAlertProps["children"];
    confirmButtonText?: ConfirmAlertProps["confirmText"];
    confirmButtonProps?: ConfirmAlertProps["confirmButtonProps"];
    cancelButtonText?: ConfirmAlertProps["cancelText"];
    cancelButtonProps?: ConfirmAlertProps["cancelButtonProps"];
  };
};
export default function TableActionsMenuItemExportJSON<
  T extends object,
  J extends JSONOutput = T[]
>(props: TableActionsMenuItemExportJSONProps<T, J>) {
  const { context, fetchJSON, menuItemText, isDisabled, confirmationAlert } =
    props;

  const handleClick = async () => {
    try {
      const json = await fetchJSON(context);
      const blob = new Blob([JSON.stringify(json)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "export.json";
      a.click();
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const text = menuItemText
    ? menuItemText(context)
    : `Export to JSON (${context.selectedRows.length})`;

  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      {confirmationAlert && (
        <ConfirmAlert
          alertTitle={confirmationAlert.title ?? "Confirm Export"}
          handleConfirm={handleClick}
          isOpen={isOpen}
          onClose={onClose}
          confirmButtonProps={{
            colorScheme: "blue",
            ...confirmationAlert.confirmButtonProps,
          }}
          cancelButtonProps={{
            ...confirmationAlert.cancelButtonProps,
          }}
          confirmText={confirmationAlert.confirmButtonText ?? "Confirm"}
          cancelText={confirmationAlert.cancelButtonText ?? "Cancel"}
          performingConfirmActionText="Exporting..."
        >
          {confirmationAlert.body}
        </ConfirmAlert>
      )}
      <MenuItem
        onClick={confirmationAlert ? onOpen : handleClick}
        isDisabled={isDisabled ? isDisabled(context) : false}
      >
        {text}
      </MenuItem>
    </>
  );
}

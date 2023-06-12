import { MenuItem, useDisclosure } from "@chakra-ui/react";
import { ConfirmAlert } from "../../ConfirmAlert";
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
  requireConfirmationAlert?: boolean;
};
export default function TableActionsMenuItemExportJSON<
  T extends object,
  J extends JSONOutput = T[]
>(props: TableActionsMenuItemExportJSONProps<T, J>) {
  const {
    context,
    fetchJSON,
    menuItemText,
    isDisabled,
    requireConfirmationAlert = true,
  } = props;

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
      <ConfirmAlert
        alertTitle="Confirm Export"
        handleConfirm={handleClick}
        isOpen={isOpen}
        onClose={onClose}
        confirmButtonProps={{
          colorScheme: "blue",
        }}
      />
      <MenuItem
        onClick={requireConfirmationAlert ? onOpen : handleClick}
        isDisabled={isDisabled ? isDisabled(context) : false}
      >
        {text}
      </MenuItem>
    </>
  );
}

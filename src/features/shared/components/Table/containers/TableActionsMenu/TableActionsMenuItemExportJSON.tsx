import { MenuItem } from "@chakra-ui/react";
import { TableActionMenuContext } from "./index";

/**
 * Add this to the `actionItems` prop of a `TableActionMenu` to add JSON Export functionality
 * TODO: CSV Export
 */

export type TableActionsMenuItemExportJSONProps<T extends Object> = {
  context: TableActionMenuContext<T>;
  fetchJSON: (context: TableActionMenuContext<T>) => Promise<T[]>;
  menuItemText?: (context: TableActionMenuContext<T>) => string;
  isDisabled?: (context: TableActionMenuContext<T>) => boolean;
};
export default function TableActionsMenuItemExportJSON<T extends Object>(
  props: TableActionsMenuItemExportJSONProps<T>
) {
  const { context, fetchJSON, menuItemText, isDisabled } = props;

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

  return (
    <>
      <MenuItem
        onClick={handleClick}
        isDisabled={isDisabled ? isDisabled(context) : false}
      >
        {text}
      </MenuItem>
    </>
  );
}

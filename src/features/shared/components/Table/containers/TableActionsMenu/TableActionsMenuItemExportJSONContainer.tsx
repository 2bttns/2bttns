import { useCallback, useEffect, useMemo } from "react";
import { TableActionMenuContext } from ".";
import {
  api,
  apiClient,
  RouterInputs,
  RouterOutputs,
} from "../../../../../../utils/api";
import TableActionsMenuItemExportJSON from "../../views/TableActionsMenuItemExportJSON";

export type TableActionsMenuItemExportJSONContainerProps<T extends object> = {
  context: TableActionMenuContext<T>;
  exportDataQueryOptions?: RouterInputs["exportData"]["exportData"];

  // Use this to define how to calculate the count of items to export
  // e.g. Display the count of selected rows instead of the total count, or display only the count of a specific type of object like gameobjects
  count: (
    context: TableActionMenuContext<T>,
    countData: RouterOutputs["exportData"]["exportData"]["count"]
  ) => number;

  // Text to display in the menu item
  // e.g. "Export Selected to JSON"
  exportText?: (countValue: number) => string;
};

export default function TableActionsMenuItemExportJSONContainer<
  T extends object
>(props: TableActionsMenuItemExportJSONContainerProps<T>) {
  const {
    context,
    exportDataQueryOptions = {},
    count,
    exportText = (countValue) => `Export (${countValue})`,
  } = props;
  const countQuery = api.exportData.exportData.useQuery({
    ...exportDataQueryOptions,
    includeCount: true,
  });
  const countValue = useMemo(() => {
    return count(context, countQuery.data?.count);
  }, [count]);

  const menuItemText = useCallback(() => {
    return exportText(countValue);
  }, [countValue, exportText]);

  useEffect(() => {
    if (context.isOpen) {
      // refetch the count when the menu is opened
      // otherwise, the count will be stale if items are created/updated/deleted in a way that affects the current count
      countQuery.refetch().catch(console.error);
    }
  }, [context.isOpen]);

  return (
    <TableActionsMenuItemExportJSON
      context={context}
      menuItemText={menuItemText}
      isDisabled={() => countValue === 0}
      fetchJSON={async () => {
        if (countValue === 0) {
          return {};
        }

        const data = await apiClient.exportData.exportData.query(
          exportDataQueryOptions
        );

        return data;
      }}
    />
  );
}

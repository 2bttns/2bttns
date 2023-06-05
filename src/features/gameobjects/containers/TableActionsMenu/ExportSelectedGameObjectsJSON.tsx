import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemExportJSON from "../../../shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemExportJSON";
import { GameObjectData } from "../GameObjectsTable";

export type ExportSelectedGameObjectsJSONProps = {
  context: TableActionMenuContext<GameObjectData>;
};

export default function ExportSelectedGameObjectsJSON(
  props: ExportSelectedGameObjectsJSONProps
) {
  const { context } = props;
  return (
    <TableActionsMenuItemExportJSON
      context={context}
      fetchJSON={async (ctx) => {
        return ctx.selectedRows.map((row) => {
          return row;
        });
      }}
      menuItemText={(ctx) =>
        `Export Selected to JSON (${ctx.selectedRows.length})`
      }
      isDisabled={(ctx) => ctx.selectedRows.length === 0}
    />
  );
}

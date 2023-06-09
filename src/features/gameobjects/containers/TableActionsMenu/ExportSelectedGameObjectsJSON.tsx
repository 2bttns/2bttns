import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemExportJSONContainer from "../../../shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemExportJSONContainer";
import { GameObjectData } from "../GameObjectsTable";

export type ExportSelectedGameObjectsJSONProps = {
  context: TableActionMenuContext<GameObjectData>;
};

export default function ExportSelectedGameObjectsJSON(
  props: ExportSelectedGameObjectsJSONProps
) {
  const { context } = props;
  return (
    <TableActionsMenuItemExportJSONContainer
      context={context}
      count={(ctx, countData) => {
        return countData?.gameObjects ?? 0;
      }}
      exportText={(countValue) => `Export Selected to JSON (${countValue})`}
      exportDataQueryOptions={{
        includeCount: true,
        includeGames: false,
        includeGameObjects: true,
        includeTags: true,
        filterGameObjectIds: context.selectedRows.map((g) => g.id).join(","),
      }}
    />
  );
}

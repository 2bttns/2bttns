import { api, apiClient } from "../../../../utils/api";
import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemExportJSON from "../../../shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemExportJSON";
import { GameObjectData } from "../GameObjectsTable";

export type ExportAllGameObjectsJSONProps = {
  context: TableActionMenuContext<GameObjectData>;
};

export default function ExportAllGameObjectsJSON(
  props: ExportAllGameObjectsJSONProps
) {
  const { context } = props;
  const gameObjectCountQuery = api.gameObjects.getCount.useQuery();
  const count = gameObjectCountQuery.data?.count ?? 0;

  return (
    <TableActionsMenuItemExportJSON
      context={context}
      // TODO: Export all (total # across db) in menu text
      // May need to separate this into its own component
      menuItemText={() => `Export All to JSON${count ? ` (${count})` : ""}`}
      isDisabled={() => count === 0}
      fetchJSON={async () => {
        if (count === 0) {
          return [];
        }

        const allItems = await apiClient.gameObjects.getAll.query({
          take: count,
          includeOutgoingRelationships: true,
        });

        return allItems.gameObjects;
      }}
    />
  );
}

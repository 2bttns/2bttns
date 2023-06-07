import { Tag } from "@prisma/client";
import { api, apiClient } from "../../../../utils/api";
import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemExportJSON from "../../../shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemExportJSON";
import { GameObjectData } from "../GameObjectsTable";

export type ExportAllGameObjectsJSONProps = {
  context: TableActionMenuContext<GameObjectData>;
  filteredTags?: Tag["id"][];
};

export default function ExportAllGameObjectsJSON(
  props: ExportAllGameObjectsJSONProps
) {
  const { context, filteredTags } = props;
  const filterTagIds = filteredTags?.join(",") || undefined;
  const gameObjectCountQuery = api.exportData.exportData.useQuery({
    includeCount: true,
    includeGames: false,
    includeGameObjects: true,
    includeTags: false,
    filterTagIds,
  });
  const count = gameObjectCountQuery.data?.count?.gameObjects ?? 0;

  return (
    <TableActionsMenuItemExportJSON
      context={context}
      menuItemText={() => `Export All to JSON${count ? ` (${count})` : ""}`}
      isDisabled={() => count === 0}
      fetchJSON={async () => {
        if (count === 0) {
          return {};
        }
        console.log("FOO");
        console.log(filterTagIds);

        const data = await apiClient.exportData.exportData.query({
          includeCount: true,
          includeGames: false,
          includeGameObjects: true,
          includeTags: Boolean(filteredTags?.length),
          filterTagIds,
        });

        return data;
      }}
    />
  );
}

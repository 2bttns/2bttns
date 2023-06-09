import { Tag } from "@prisma/client";
import { useEffect } from "react";
import { api, apiClient } from "../../../../utils/api";
import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemExportJSON from "../../../shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemExportJSON";
import { GameObjectData } from "../GameObjectsTable";

export type ExportAllGameObjectsJSONProps = {
  context: TableActionMenuContext<GameObjectData>;
  filteredTags?: Tag["id"][];
  filterAllowUntaggedGameObjects?: boolean;
};

export default function ExportAllGameObjectsJSON(
  props: ExportAllGameObjectsJSONProps
) {
  const {
    context,
    filteredTags,
    filterAllowUntaggedGameObjects = true,
  } = props;
  const filterTagIds = filteredTags?.join(",");
  const gameObjectCountQuery = api.exportData.exportData.useQuery({
    includeCount: true,
    includeGames: false,
    includeGameObjects: true,
    includeTags: false,
    filterTagIds,
    filterAllowUntaggedGameObjects,
  });
  const count = gameObjectCountQuery.data?.count?.gameObjects ?? 0;

  useEffect(() => {
    if (context.isOpen) {
      // refetch the count when the menu is opened
      // otherwise, the count will be stale if items are created/updated/deleted in a way that affects the current count
      gameObjectCountQuery.refetch().catch(console.error);
    }
  }, [context.isOpen]);

  return (
    <TableActionsMenuItemExportJSON
      context={context}
      menuItemText={() => `Export All to JSON${count ? ` (${count})` : ""}`}
      isDisabled={() => count === 0}
      fetchJSON={async () => {
        if (count === 0) {
          return {};
        }

        const data = await apiClient.exportData.exportData.query({
          includeCount: true,
          includeGames: false,
          includeGameObjects: true,
          includeTags: Boolean(filteredTags?.length),
          filterTagIds,
          filterAllowUntaggedGameObjects,
        });

        return data;
      }}
    />
  );
}

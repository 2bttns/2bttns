import { Tag } from "@prisma/client";
import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemExportJSONContainer from "../../../shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemExportJSONContainer";
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

  return (
    <TableActionsMenuItemExportJSONContainer
      context={context}
      exportText={(countValue) => `Export All to JSON (${countValue})`}
      count={(ctx, countData) => {
        return countData?.gameObjects ?? 0;
      }}
      exportDataQueryOptions={{
        count: "include",
        includeGames: false,
        includeGameObjects: true,
        includeTags: Boolean(filteredTags?.length),
        filterTagIds,
        filterAllowUntaggedGameObjects,
        filterTagsMustBeInGameObjects: true,
      }}
    />
  );
}

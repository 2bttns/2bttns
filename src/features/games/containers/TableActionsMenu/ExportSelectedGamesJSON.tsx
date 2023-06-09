import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemExportJSONContainer from "../../../shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemExportJSONContainer";
import { GameData } from "../GamesTable";

export type ExportSelectedGamesJSONProps = {
  context: TableActionMenuContext<GameData>;
};

export default function ExportSelectedGamesJSON(
  props: ExportSelectedGamesJSONProps
) {
  const { context } = props;
  return (
    <TableActionsMenuItemExportJSONContainer
      context={context}
      count={(ctx, countData) => {
        return countData?.games ?? 0;
      }}
      exportText={(countValue) => `Export Selected to JSON (${countValue})`}
      exportDataQueryOptions={{
        count: "include",
        includeGames: true,
        includeGameObjects: true,
        includeTags: true,
        filterTagsMustBeInGames: true,
        filterGameIds: context.selectedRows.map((g) => g.id).join(","),
        filterAllowUntaggedGameObjects: false,
      }}
    />
  );
}

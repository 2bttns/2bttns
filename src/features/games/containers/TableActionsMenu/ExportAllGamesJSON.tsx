import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemExportJSONContainer from "../../../shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemExportJSONContainer";
import { GameData } from "../GamesTable";

export type ExportAllGamesProps = {
  context: TableActionMenuContext<GameData>;
};

export default function ExportAllGamesJSON(props: ExportAllGamesProps) {
  const { context } = props;

  return (
    <TableActionsMenuItemExportJSONContainer
      context={context}
      exportText={(countValue) => `Export All to JSON (${countValue})`}
      count={(ctx, countData) => {
        return countData?.games ?? 0;
      }}
      exportDataQueryOptions={{
        includeCount: true,
        includeGames: true,
        includeGameObjects: true,
        includeTags: true,
        filterTagsMustBeInGames: true,
      }}
    />
  );
}

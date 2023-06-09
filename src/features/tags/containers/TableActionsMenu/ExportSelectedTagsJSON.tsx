import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemExportJSONContainer from "../../../shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemExportJSONContainer";
import { TagData } from "../TagsTable";

export type ExportSelectedTagsJSONProps = {
  context: TableActionMenuContext<TagData>;
};

export default function ExportSelectedTagsJSON(
  props: ExportSelectedTagsJSONProps
) {
  const { context } = props;
  return (
    <TableActionsMenuItemExportJSONContainer
      context={context}
      count={(ctx, countData) => {
        return countData?.tags ?? 0;
      }}
      exportText={(countValue) => `Export Selected to JSON (${countValue})`}
      exportDataQueryOptions={{
        count: "include",
        includeGames: false,
        includeGameObjects: true,
        includeTags: true,
        filterTagIds: context.selectedRows.map((t) => t.id).join(","),
        filterAllowUntaggedGameObjects: false,
      }}
    />
  );
}

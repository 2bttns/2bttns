import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemExportJSONContainer from "../../../shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemExportJSONContainer";
import { TagData } from "../TagsTable";

export type ExportAllTagsProps = {
  context: TableActionMenuContext<TagData>;
};

export default function ExportAllTagsJSON(props: ExportAllTagsProps) {
  const { context } = props;

  return (
    <TableActionsMenuItemExportJSONContainer
      context={context}
      exportText={(countValue) => `Export All to JSON (${countValue})`}
      count={(ctx, countData) => {
        return countData?.tags ?? 0;
      }}
      exportDataQueryOptions={{
        count: "include",
        includeGames: false,
        includeGameObjects: true,
        includeTags: true,
        filterAllowUntaggedGameObjects: false,
      }}
    />
  );
}

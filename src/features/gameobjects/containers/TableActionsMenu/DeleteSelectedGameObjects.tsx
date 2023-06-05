import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemDelete from "../../../shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemDelete";
import useDeleteGameObjects from "../../hooks/useDeleteGameObjects";
import { GameObjectData } from "../GameObjectsTable";

export type DeleteSelectedGameObjectsProps = {
  context: TableActionMenuContext<GameObjectData>;
};

export default function DeleteSelectedGameObjects(
  props: DeleteSelectedGameObjectsProps
) {
  const { context } = props;
  const { handleDeleteGameObjects } = useDeleteGameObjects();

  return (
    <TableActionsMenuItemDelete
      context={context}
      handleDelete={async () => {
        await handleDeleteGameObjects(
          context.selectedRows.map((row) => row.id)
        );
      }}
    />
  );
}

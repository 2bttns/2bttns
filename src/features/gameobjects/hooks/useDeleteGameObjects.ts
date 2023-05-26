import { GameObject } from "@prisma/client";
import { api } from "../../../utils/api";

export type UseDeleteGameObjectsConfig = {
  onDeleted?: (gameObjectIds: GameObject["id"][]) => void;
};

export default function useDeleteGameObjects(
  props: UseDeleteGameObjectsConfig = {}
) {
  const { onDeleted } = props;
  const utils = api.useContext();
  const deleteGameObjectsMutation = api.gameObjects.delete.useMutation();
  const handleDeleteGameObjects = async (ids: GameObject["id"][]) => {
    try {
      const idsString = ids.join(",");
      await deleteGameObjectsMutation.mutateAsync({ id: idsString });
      if (onDeleted) {
        onDeleted(ids);
      }
      await utils.gameObjects.invalidate();
    } catch (error) {
      window.alert("Error deleting game object(s)\n See console for details");
      console.error(error);
    }
  };

  return { handleDeleteGameObjects };
}

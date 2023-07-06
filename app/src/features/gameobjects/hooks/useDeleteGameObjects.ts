import { useToast } from "@chakra-ui/react";
import { GameObject } from "@prisma/client";
import { api } from "../../../utils/api";

export type UseDeleteGameObjectsConfig = {
  onDeleted?: (gameObjectIds: GameObject["id"][]) => void;
};

export default function useDeleteGameObjects(
  props: UseDeleteGameObjectsConfig = {}
) {
  const { onDeleted } = props;
  const toast = useToast();
  const utils = api.useContext();
  const deleteGameObjectsMutation = api.gameObjects.delete.useMutation();
  const handleDeleteGameObjects = async (ids: GameObject["id"][]) => {
    if (ids.length === 0) return;
    const deleteToast = toast({
      title: `Deleting ${ids.length} game object(s)`,
      status: "loading",
    });

    try {
      const idsString = ids.join(",");
      await deleteGameObjectsMutation.mutateAsync({ id: idsString });
      if (onDeleted) {
        onDeleted(ids);
      }
      await utils.gameObjects.invalidate();
      toast.update(deleteToast, {
        title: `Success: Deleted ${ids.length} game object(s)`,
        status: "success",
      });
    } catch (error) {
      console.error(error);
      toast.update(deleteToast, {
        title: `Error`,
        description: `Received an unexpected error when deleting ${ids.length} game object(s). See console for details.`,
        status: "error",
      });
    }
  };

  return { handleDeleteGameObjects };
}

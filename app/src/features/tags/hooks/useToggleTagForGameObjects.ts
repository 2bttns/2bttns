import { useToast } from "@chakra-ui/react";
import { GameObject, Tag } from "@prisma/client";
import { useMemo, useState } from "react";
import { api } from "../../../utils/api";

type UseToggleTagForGameObjectsParams = {
  tagId: Tag["id"];
  gameObjectIds: GameObject["id"][];
};
export function useToggleTagForGameObjects(
  params: UseToggleTagForGameObjectsParams
) {
  const { tagId, gameObjectIds } = params;
  const toast = useToast();

  const [isApplyingChanges, setApplyingChanges] = useState(false);

  const utils = api.useContext();

  const tagQuery = api.tags.getById.useQuery({ id: tagId });
  const tagName = tagQuery.data?.tag.name ?? "Untitled Tag";

  const getGameObjectsCountQuery = api.gameObjects.getCount.useQuery({
    idFilter: gameObjectIds.join(","),
  });
  const getGameObjectsQuery = api.gameObjects.getAll.useQuery(
    {
      idFilter: gameObjectIds.join(","),
      take: getGameObjectsCountQuery.data?.count ?? 0,
    },
    {
      enabled: getGameObjectsCountQuery.isSuccess,
    }
  );

  const isTagAppliedToAll = useMemo(() => {
    if (!getGameObjectsQuery.data) return false;
    const tagsByGameObject: {
      [gameObjectId: string]: { [tagId: string]: boolean };
    } = {};

    getGameObjectsQuery.data.gameObjects.forEach(({ id, tags }) => {
      tagsByGameObject[id] = {};
      tags.forEach((tagId) => {
        tagsByGameObject[id]![tagId] = true;
      });
    });

    return gameObjectIds.every((gameObjectId) => {
      const gameObjectTags = tagsByGameObject[gameObjectId];
      if (!gameObjectTags) return false;
      return gameObjectTags[tagId];
    });
  }, [getGameObjectsQuery.data, tagId, gameObjectIds]);

  const updateTagMutation = api.tags.updateById.useMutation();
  const handleApplyTag = async () => {
    if (isApplyingChanges) return;

    const tagOperation = gameObjectIds.length > 1 ? "Bulk Tag" : "Tag";

    toast.closeAll();
    const applyTagToast = toast({
      title: `Performing ${tagOperation} operation...`,
      status: "loading",
      duration: null,
    });

    setApplyingChanges(true);
    try {
      await updateTagMutation.mutateAsync({
        id: tagId,
        data: {
          addGameObjects: isTagAppliedToAll ? undefined : gameObjectIds,
          removeGameObjects: isTagAppliedToAll ? gameObjectIds : undefined,
        },
      });
      await utils.gameObjects.invalidate();

      toast.update(applyTagToast, {
        title: `Saved`,
        status: "success",
      });
    } catch (error) {
      console.error(error);
      toast.update(applyTagToast, {
        title: `Error: ${tagOperation} operation failed`,
        description: "See console for more details.",
        status: "error",
      });
    }
    setApplyingChanges(false);
  };

  const areQueriesLoading = useMemo(() => {
    return (
      getGameObjectsQuery.isLoading ||
      updateTagMutation.isLoading ||
      isApplyingChanges
    );
  }, [
    getGameObjectsQuery.isLoading,
    updateTagMutation.isLoading,
    isApplyingChanges,
  ]);

  return {
    isTagAppliedToAll,
    handleApplyTag,
    areQueriesLoading,
  };
}

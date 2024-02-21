import { useToast } from "@chakra-ui/react";
import { GameObject, Tag } from "@prisma/client";
import { useMemo } from "react";
import { api } from "../../../utils/api";

export type UseToggleTagForGameObjectsParams = {
  tagId: Tag["id"];
  gameObjectIds: GameObject["id"][];
  operation?: "add" | "remove" | "toggle";
};
export function useToggleTagForGameObjects(
  params: UseToggleTagForGameObjectsParams
) {
  const { tagId, gameObjectIds, operation = "toggle" } = params;
  const toast = useToast();

  const utils = api.useContext();

  const tagQuery = api.tags.getById.useQuery({ id: tagId });

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

  const updateTagMutation = api.tags.updateById.useMutation({
    onMutate: async (next) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await utils.gameObjects.getAll.cancel();

      // Snapshot the previous value
      const previous = utils.gameObjects.getAll.getData({
        idFilter: gameObjectIds.join(","),
        take: getGameObjectsCountQuery.data?.count ?? 0,
      });

      const updatedGameObjects = previous?.gameObjects?.map((gameObject) => {
        const hasTag = gameObject.tags.includes(tagId);
        const updatedTags = hasTag
          ? gameObject.tags.filter((t) => t !== tagId) // Remove tag
          : [...gameObject.tags, tagId]; // Add tag
        return {
          ...gameObject,
          tags: updatedTags,
        };
      });

      // Optimistically update to the new value
      if (updatedGameObjects) {
        utils.gameObjects.getAll.setData(
          {
            idFilter: gameObjectIds.join(","),
            take: getGameObjectsCountQuery.data?.count ?? 0,
          },
          {
            gameObjects: updatedGameObjects,
          }
        );
      }

      // Return a context object with the snapshotted value
      return { previous };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, next, context) => {
      if (!context?.previous?.gameObjects) return;
      utils.gameObjects.getAll.setData(
        {
          idFilter: gameObjectIds.join(","),
          take: getGameObjectsCountQuery.data?.count ?? 0,
        },
        {
          gameObjects: context.previous.gameObjects,
        }
      );
    },
    // Always refetch after error or success:
    onSettled: async () => {
      console.log("INVALIDATE ALL");
      await utils.gameObjects.invalidate();
    },
  });
  const handleApplyTag = async () => {
    const tagOperation = gameObjectIds.length > 1 ? "Bulk Tag" : "Tag";

    toast.closeAll();
    const applyTagToast = toast({
      title: `Performing ${tagOperation} operation...`,
      status: "loading",
      duration: null,
    });

    try {
      let doAdd = operation === "add";
      let doRemove = operation === "remove";

      if (operation === "toggle") {
        doAdd = !isTagAppliedToAll;
        doRemove = isTagAppliedToAll;
      }

      await updateTagMutation.mutateAsync({
        id: tagId,
        data: {
          addGameObjects: doAdd ? gameObjectIds : undefined,
          removeGameObjects: doRemove ? gameObjectIds : undefined,
        },
      });
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
  };

  const areQueriesLoading = useMemo(() => {
    return getGameObjectsQuery.isLoading || updateTagMutation.isLoading;
  }, [getGameObjectsQuery.isLoading, updateTagMutation.isLoading]);

  return {
    isTagAppliedToAll,
    handleApplyTag,
    areQueriesLoading,
  };
}

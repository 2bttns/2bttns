import { GameObject, GameObjectRelationship, Tag } from "@prisma/client";
import { api } from "../../../utils/api";
import exportCsv from "../utils/exportCsv";

export type UseCsvExportParams = {
  tagsToExportBy?: Tag["id"][];
};

export function useCsvExportGameObjects(params: UseCsvExportParams) {
  const { tagsToExportBy } = params;

  async function processGameObjectsForExport(
    gameObjects: (GameObject & {
      tags: Tag[];
      FromGameObjectRelationship: GameObjectRelationship[];
    })[]
  ) {
    return gameObjects.map((gameObject) => {
      const tagRelationships = gameObject.tags.map((tag) => tag.id).join();

      const outgoingRelationships = gameObject.FromGameObjectRelationship.map(
        (relationship) => ({
          to: relationship.toGameObjectId,
          weight: relationship.weightId,
        })
      );

      const {
        tags,
        FromGameObjectRelationship,
        createdAt,
        updatedAt,
        description,
        ...rest
      } = gameObject;

      return {
        ...rest,
        description: description ?? undefined,
        tags: tagRelationships,
        outgoingRelationships,
      };
    });
  }

  const gameObjectsCount = api.gameObjects.getCount.useQuery({
    filter: tagsToExportBy
      ? {
          tag: {
            include: tagsToExportBy,
            exclude: [],
            includeUntagged: false,
          },
        }
      : undefined,
  });

  const gameObjectsQuery = api.gameObjects.getAll.useQuery(
    {
      take: gameObjectsCount.data?.count,
      filter: tagsToExportBy
        ? {
            tag: {
              include: tagsToExportBy,
              exclude: [],
              includeUntagged: false,
            },
          }
        : undefined,
      includeTags: true,
      includeOutgoingRelationships: true,
    },
    {
      enabled: false,
      onSuccess: async (data) => {
        if (!data) return;
        const processed = await processGameObjectsForExport(data.gameObjects);
        await exportCsv(processed, "export.csv");
      },
    }
  );

  const handleExport = () => {
    gameObjectsQuery.refetch();
  };

  return { handleExport };
}

import { z } from "zod";
import { api } from "../../../utils/api";
import csvParse from "../utils/csvParse";

export type UseCsvImportGameObjectsOptions = {};

const validator = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  tags: z
    .preprocess((tags) => {
      if (tags && typeof tags === "string") {
        return tags.split(",").map((tag) => ({ id: tag }));
      }
      return [];
    }, z.array(z.object({ id: z.string() })))
    .optional(),
  outgoingRelationships: z
    .preprocess((outgoingRelationships) => {
      if (outgoingRelationships && typeof outgoingRelationships === "string") {
        const outgoingRelationshipsJson = JSON.parse(outgoingRelationships) as {
          to: string;
          weight: string;
        }[];
        return outgoingRelationshipsJson;
      }
      return [];
    }, z.array(z.object({ to: z.string(), weight: z.string() })))
    .optional(),
});

export type ImportResult = {
  gameObjects: {
    successful: typeof validator._type[];
    failed: { line: any; error: Error }[];
  };
  relationships: {
    successful: number;
    failed: number;
  };
};

export type ImportGameObjectsOptions = {
  file: File;
  parentTags?: string[];
};

export default function useCsvImportGameObjects(
  options?: UseCsvImportGameObjectsOptions
) {
  const utils = api.useContext();
  const createGameObjectMutation = api.gameObjects.create.useMutation();
  const upsertGameObjectRelationshipMutation =
    api.gameObjects.upsertRelationship.useMutation();

  const importGameObjects = async ({
    file,
    parentTags,
  }: ImportGameObjectsOptions): Promise<ImportResult> => {
    const parentTagsToAdd = parentTags?.map((tagId) => ({ id: tagId }));

    // Relationships are created after all game objects have been created
    const relationshipsToUpsert: {
      from: string;
      to: string;
      weight: string;
    }[] = [];

    const gameObjectsResults: ImportResult["gameObjects"] = {
      successful: [],
      failed: [],
    };
    await csvParse(file, async (line) => {
      try {
        const {
          id,
          name,
          description,
          tags: importedTags,
          outgoingRelationships,
        } = await validator.parseAsync(line);

        const tags = [...(parentTagsToAdd ?? []), ...(importedTags ?? [])];

        const result = await createGameObjectMutation.mutateAsync({
          id,
          name,
          description: description ?? undefined,
          tags,
        });

        gameObjectsResults.successful.push(result.createdGameObject);

        const relationships = outgoingRelationships?.map((rel) => {
          return {
            from: result.createdGameObject.id,
            to: rel.to,
            weight: rel.weight,
          };
        });
        console.log("PUSH", relationships);
        relationshipsToUpsert.push(...(relationships ?? []));
      } catch (error) {
        gameObjectsResults.failed.push({ line, error: error as Error });
      }
    });

    console.log("STARTING");
    const relationshipResults: ImportResult["relationships"] = {
      successful: 0,
      failed: 0,
    };
    const upsertRelationships = relationshipsToUpsert.map((rel, i) => {
      return new Promise<void>((resolve) => {
        console.log("UPSERT", rel);
        upsertGameObjectRelationshipMutation
          .mutateAsync({
            gameObjectId1: rel.from,
            gameObjectId2: rel.to,
            weightId: rel.weight,
          })
          .then((result) => {
            relationshipResults.successful++;
          })
          .catch((error) => {
            relationshipResults.failed++;
          })
          .finally(() => {
            resolve();
          });
      });
    });
    await Promise.all(upsertRelationships);

    if (
      gameObjectsResults.successful.length > 0 ||
      relationshipResults.successful > 0
    ) {
      await utils.gameObjects.invalidate();
    }

    return {
      gameObjects: gameObjectsResults,
      relationships: relationshipResults,
    };
  };

  return { importGameObjects };
}

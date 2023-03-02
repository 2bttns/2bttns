import { z } from "zod";
import { api } from "../../../utils/api";
import csvParse from "../utils/csvParse";

export type UseCsvImportGameObjectsOptions = {};

const validator = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  tags: z.preprocess((tags) => {
    if (tags && typeof tags === "string") {
      return tags.split(",").map((tag) => ({ id: tag }));
    }
    return [];
  }, z.array(z.object({ id: z.string() })).optional()),
});

export type Created = typeof validator._type;
export type Failed = { line: any; error: Error };

export type ImportResult = {
  created: Created[];
  failed: Failed[];
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

  const importGameObjects = async ({
    file,
    parentTags,
  }: ImportGameObjectsOptions): Promise<ImportResult> => {
    const parentTagsToAdd = parentTags?.map((tagId) => ({ id: tagId }));

    const created: Created[] = [];
    const failed: Failed[] = [];
    await csvParse(file, async (line) => {
      try {
        // TODO: Support custom fields
        const {
          id,
          name,
          description,
          tags: importedTags,
        } = await validator.parseAsync(line);

        const tags = [...(parentTagsToAdd ?? []), ...(importedTags ?? [])];

        const result = await createGameObjectMutation.mutateAsync({
          id,
          name,
          description: description ?? undefined,
          tags,
        });
        created.push(result.createdGameObject);
      } catch (error) {
        failed.push({ line, error: error as Error });
      }
    });

    if (created.length > 0) {
      await utils.gameObjects.invalidate();
    }

    return { created, failed };
  };

  return { importGameObjects };
}

import { z } from "zod";
import { api } from "../../../utils/api";
import csvParse from "../utils/csvParse";

export type UseCsvImportGameObjectsOptions = {};

const validator = z.object({
  id: z.string().optional(),
  name: z.string(),
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
    const tags = parentTags?.map((tagId) => ({ id: tagId }));

    const created: Created[] = [];
    const failed: Failed[] = [];
    await csvParse(file, async (line) => {
      try {
        // TODO: Support custom fields
        const { id, name } = await validator.parseAsync(line);
        const result = await createGameObjectMutation.mutateAsync({
          id,
          name,
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

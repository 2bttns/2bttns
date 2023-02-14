import { z } from "zod";
import { api } from "../../../utils/api";
import csvParse from "../utils/csvParse";

export type UseCsvImportGameObjectsOptions = {};

export type ImportGameObjectsOptions = {
  file: File;
  parentTags?: string[];
};

export default function useCsvImportGameObjects(
  options?: UseCsvImportGameObjectsOptions
) {
  const createGameObjectMutation = api.gameObjects.create.useMutation();

  const importGameObjects = async ({
    file,
    parentTags,
  }: ImportGameObjectsOptions) => {
    const tags = parentTags?.map((tagId) => ({ id: tagId }));

    const validator = z.object({
      id: z.string().optional(),
      name: z.string(),
    });

    const created: typeof validator._type[] = [];
    const failed: { line: any; error: Error }[] = [];
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

    const alert = `[csvImport] ${created.length} game objects created. ${failed.length} failed.`;
    console.info(alert);
    console.info("CREATED:", created);
    console.info("FAILED:", failed);
    if (typeof window === "undefined") return;
    window.alert(`${alert} See console for details.`);
  };

  return { importGameObjects };
}

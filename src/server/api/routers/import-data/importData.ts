import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  jsonBase64: z.string().describe("Base64 encoded JSON file to import"),
});

const output = z.object({
  foo: z.string(),
});

export const importData = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Import Data",
      description: "Import 2bttns data from a JSON file.",
      tags: [OPENAPI_TAGS.IMPORT_DATA],
      method: "POST",
      path: "/import-data",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .mutation(async ({ input, ctx }) => {
    const { jsonBase64 } = input;
    console.log("input", jsonBase64);
    const buffer = Buffer.from(jsonBase64, "base64");
    const jsonStr = buffer.toString("utf-8");
    const json = JSON.parse(jsonStr);
    console.log("json", json);

    return { foo: "bar" };
  });

import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { anyAuthProtectedProcedure } from "../../trpc";

export const hello = anyAuthProtectedProcedure
  .meta({
    openapi: {
      summary: "Say hello",
      description: "Say hello to the world",
      tags: [OPENAPI_TAGS.EXAMPLE],
      method: "GET",
      path: "/example/hello",
    },
  })
  .input(z.object({ text: z.string().optional() }))
  .output(z.object({ greeting: z.string() }))
  .query(({ input }) => {
    return {
      greeting: `Hello ${input.text}`,
    };
  });

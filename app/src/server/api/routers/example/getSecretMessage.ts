import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { protectedProcedure } from "../../trpc";

export const getSecretMessage = protectedProcedure
  .meta({
    openapi: {
      summary: "Get secret message",
      description: "Get secret message",
      tags: [OPENAPI_TAGS.EXAMPLE],
      method: "GET",
      path: "/example/getSecretMessage",
      protect: true,
    },
  })
  .input(z.void())
  .output(z.string())
  .query(() => {
    return "you can now see this secret message!";
  });

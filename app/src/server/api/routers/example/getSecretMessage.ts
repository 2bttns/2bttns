import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { anyAuthProtectedProcedure } from "../../trpc";

export const getSecretMessage = anyAuthProtectedProcedure
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
  .query(({ ctx }) => {
    console.log("Viewed secret message with authData:", ctx.authData);
    return `You can now see this message! (via auth type of ${ctx.authData.type})`;
  });

import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { anyAuthProtectedProcedure } from "../../trpc";

export const getSecretMessage = anyAuthProtectedProcedure
  .meta({
    openapi: {
      summary: "Get secret message",
      description:
        "This endpoint will return a message that tells you what type of authentication you used, if you are authenticated.",
      tags: [OPENAPI_TAGS.EXAMPLE],
      method: "GET",
      path: "/example/getSecretMessage",
      protect: true,
    },
  })
  .input(z.void())
  .output(z.string())
  .query(({ ctx }) => {
    return `You can now see this message! (via auth type of ${ctx.authData.type})`;
  });

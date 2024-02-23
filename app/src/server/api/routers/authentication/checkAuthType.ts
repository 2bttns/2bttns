import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { anyAuthProtectedProcedure } from "../../trpc";

export const checkAuthType = anyAuthProtectedProcedure
  .meta({
    openapi: {
      summary: "Check Auth Type",
      description:
        "Returns a message that tells you what type of authentication you used to call this endpoint, if you are authenticated.",
      tags: [OPENAPI_TAGS.AUTHENTICATION],
      method: "GET",
      path: "/authentication/checkAuthType",
      protect: true,
    },
  })
  .input(z.void())
  .output(z.string())
  .query(({ ctx }) => {
    return `${ctx.authData.type}`;
  });

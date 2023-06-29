import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.void();

const output = z.object({
  count: z.number(),
});

export const getCount = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get Admin Count",
      description:
        "Get the total number of administrators. Useful for pagination.",
      tags: [OPENAPI_TAGS.ADMINISTRATORS],
      method: "GET",
      path: "/administrators/count",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .query(async ({ input, ctx }) => {
    const count = await ctx.prisma.allowedAdmin.count({});
    const processed: z.infer<typeof output> = {
      count,
    };
    return processed;
  });

import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z
  .object({
    idFilter: z
      .string()
      .describe("Tag ID to filter by. Can be used with other filters.")
      .optional(),
    nameFilter: z
      .string()
      .describe("Tag name to filter by. Can be used with other filters.")
      .optional(),
  })
  .optional();

const output = z.object({
  count: z.number(),
});

export const getCount = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get Tag Count",
      description: "Get Tag Count",
      tags: [OPENAPI_TAGS.TAGS],
      method: "GET",
      path: "/tags/count",
      protect: true,
    },
  })

  .input(input)
  .output(output)
  .query(async ({ ctx, input }) => {
    const count = await ctx.prisma.tag.count({
      where: {
        OR:
          input?.idFilter || input?.nameFilter
            ? [
                { id: { contains: input?.idFilter } },
                { name: { contains: input?.nameFilter } },
              ]
            : undefined,
      },
    });

    return { count };
  });

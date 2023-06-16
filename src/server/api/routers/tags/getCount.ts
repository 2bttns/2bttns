import { z } from "zod";
import { commaSeparatedStringToArray } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z
  .object({
    idFilter: commaSeparatedStringToArray
      .describe("Comma-separated tag IDs to filter by")
      .optional(),
    nameFilter: commaSeparatedStringToArray
      .describe("Comma-separated tag names to filter by")
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
                ...(input?.idFilter?.map((id) => ({ id: { contains: id } })) ||
                  []),
                ...(input?.nameFilter?.map((name) => ({
                  name: { contains: name },
                })) || []),
              ]
            : undefined,
      },
    });

    return { count };
  });

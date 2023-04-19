import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const output = z.object({
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      createdAt: z.string().describe("ISO date string"),
      updatedAt: z.string().describe("ISO date string"),
    })
  ),
});

export const getAll = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get All Tags",
      description: "Get all tags",
      tags: [OPENAPI_TAGS.TAGS],
      method: "GET",
      path: "/tags",
      protect: true,
    },
  })

  .input(
    z
      .object({
        id: z
          .string()
          .optional()
          .describe("Comma separated list of tag ids to filter by"),
      })
      .optional()
  )
  .output(output)
  .query(async ({ ctx, input }) => {
    const tagsToFilterBy = input?.id?.split(",");

    const tags = await ctx.prisma.tag.findMany({
      where: {
        id: tagsToFilterBy
          ? {
              in: tagsToFilterBy,
            }
          : undefined,
      },
    });

    const processedTags: typeof output._type["tags"] = tags.map((tag) => {
      return {
        ...tag,
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
      };
    });

    return { tags: processedTags };
  });

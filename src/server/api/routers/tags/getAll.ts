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
        idFilter: z
          .string()
          .describe("Tag ID to filter by. Can be used with other filters.")
          .optional(),
        nameFilter: z
          .string()
          .describe("Tag name to filter by. Can be used with other filters.")
          .optional(),
        take: z.number().default(10),
        skip: z.number().default(0),
        sortField: z
          .enum(["id", "name", "description", "updatedAt", "createdAt"])
          .describe("Field to sort by")
          .optional(),
        sortOrder: z
          .enum(["asc", "desc"])
          .describe("Sort order for the selected field")
          .optional(),
      })
      .optional()
  )
  .output(output)
  .query(async ({ ctx, input }) => {
    const tags = await ctx.prisma.tag.findMany({
      where: {
        OR:
          input?.idFilter || input?.nameFilter
            ? [
                { id: { contains: input?.idFilter } },
                { name: { contains: input?.nameFilter } },
              ]
            : undefined,
      },
      skip: input?.skip,
      take: input?.take,
      orderBy: input?.sortOrder
        ? {
            id: input?.sortField === "id" ? input.sortOrder : undefined,
            name: input?.sortField === "name" ? input?.sortOrder : undefined,
            description:
              input?.sortField === "description" ? input?.sortOrder : undefined,
            updatedAt:
              input?.sortField === "updatedAt" ? input?.sortOrder : undefined,
            createdAt:
              input?.sortField === "createdAt" ? input?.sortOrder : undefined,
          }
        : undefined,
    });

    const processedTags: (typeof output._type)["tags"] = tags.map((tag) => {
      return {
        ...tag,
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
      };
    });

    return { tags: processedTags };
  });

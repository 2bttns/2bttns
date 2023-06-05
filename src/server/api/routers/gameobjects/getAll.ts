import { z } from "zod";
import {
  commaSeparatedStringToArray,
  paginationSkip,
  paginationTake,
} from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z
  .object({
    take: paginationTake,
    skip: paginationSkip,
    idFilter: commaSeparatedStringToArray
      .optional()
      .describe("Comma-separated Game Object IDs to filter by"),
    nameFilter: commaSeparatedStringToArray
      .optional()
      .describe("Comma-separated Game Object names to filter by"),
    requiredTags: commaSeparatedStringToArray
      .optional()
      .describe(
        "Comma-separated list of tag IDs the resulting game objects must have"
      ),
    excludeTags: commaSeparatedStringToArray
      .optional()
      .describe(
        "Comma-separated list of tag IDs to exclude from the response. Use this to exclude game objects that have a specific tag, even if they match the `requiredTags` filter."
      ),
    includeUntagged: z
      .boolean()
      .default(true)
      .describe(
        "Set to `false` to exclude untagged Game Objects from the response"
      ),
    sortField: z
      .enum([
        "id",
        "name",
        "description",
        "updatedAt",
        "createdAt",
        "tags",
        "related",
      ])
      .describe("Field to sort by")
      .optional(),
    sortOrder: z
      .enum(["asc", "desc"])
      .describe("Sort order for the selected field")
      .optional(),
    // includeTags: booleanEnum.describe(
    //   "Set to `true` to include tags in the response"
    // ),
    // includeOutgoingRelationships: booleanEnum.describe(
    //   "Set to `true` to include outgoing relationships in the response"
    // ),
    excludeGameObjects: commaSeparatedStringToArray
      .optional()
      .describe(
        "Comma-separated list of Game Object IDs to exclude from the response"
      ),
  })
  .optional();

const output = z.object({
  gameObjects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      createdAt: z.string().describe("ISO date string"),
      updatedAt: z.string().describe("ISO date string"),
      tags: z.array(z.string()).describe("Tag IDs"),
      related: z.array(z.string().describe("Related Game Object IDs")),
    })
  ),
});

export const getAll = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get All Game Objects",
      description:
        "Get all Game Objects. Paginated by default. Supports filtering and sorting.",
      tags: [OPENAPI_TAGS.GAME_OBJECTS],
      method: "GET",
      path: "/game-objects",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .query(async ({ ctx, input }) => {
    console.log("input");
    console.log(input);

    const gameObjects = await ctx.prisma.gameObject.findMany({
      take: input?.take,
      skip: input?.skip,
      where: {
        AND: [
          {
            OR:
              input?.idFilter || input?.nameFilter
                ? [
                    ...(input?.idFilter?.map((id) => ({
                      id: { contains: id },
                    })) || []),
                    ...(input?.nameFilter?.map((name) => ({
                      name: { contains: name },
                    })) || []),
                  ]
                : undefined,
          },
          {
            id: {
              notIn: input?.excludeGameObjects,
            },
          },
          {
            OR: [
              // If includeUntagged is false, we need to filter out game objects that don't have any tags
              // {
              //   tags: input?.includeUntagged ? { none: {} } : undefined,
              // },

              {
                AND: [
                  // If requiredTags is set, we need to filter out game objects that don't have all of the required tags
                  {
                    tags: input?.requiredTags
                      ? {
                          some: {
                            id: {
                              in: input?.requiredTags,
                            },
                          },
                        }
                      : undefined,
                  },
                  // If excludeTags is set, we need to filter out game objects that have any of the excluded tags, even if they have any of the required tags
                  {
                    tags: input?.excludeTags
                      ? {
                          none: {
                            id: {
                              in: input?.excludeTags,
                            },
                          },
                        }
                      : undefined,
                  },
                ],
              },
            ],
          },
        ],
      },
      include: {
        tags: { select: { id: true } },
        FromGameObjectRelationship: { select: { toGameObjectId: true } },
      },
      orderBy: {
        id: input?.sortField === "id" ? input.sortOrder : undefined,
        name: input?.sortField === "name" ? input.sortOrder : undefined,
        description:
          input?.sortField === "description" ? input.sortOrder : undefined,
        tags:
          input?.sortField === "tags" ? { _count: input.sortOrder } : undefined,
        updatedAt:
          input?.sortField === "updatedAt" ? input.sortOrder : undefined,
        createdAt:
          input?.sortField === "createdAt" ? input.sortOrder : undefined,
        FromGameObjectRelationship:
          input?.sortField === "related"
            ? { _count: input.sortOrder }
            : undefined,
      },
    });

    const processedOutput: typeof output._type = {
      gameObjects: gameObjects.map((gameObject) => ({
        ...gameObject,
        createdAt: gameObject.createdAt.toISOString(),
        updatedAt: gameObject.updatedAt.toISOString(),
        tags: gameObject.tags.map((tag) => tag.id) ?? [],
        related:
          gameObject.FromGameObjectRelationship.map(
            (relationship) => relationship.toGameObjectId
          ) ?? [],
      })),
    };
    return processedOutput;
  });

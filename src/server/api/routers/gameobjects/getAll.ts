import { z } from "zod";
import {
  commaSeparatedStringToArray,
  paginationSkip,
  paginationTake,
} from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";
import { booleanEnum } from "./../../../shared/z";

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
    includeTagsFilter: commaSeparatedStringToArray
      .optional()
      .describe(
        "Comma-separated list of tag IDs the resulting game objects must have"
      ),
    excludeTagsFilter: commaSeparatedStringToArray
      .optional()
      .describe(
        "Comma-separated list of tag IDs to exclude from the response. Use this to exclude game objects that have a specific tag, even if they match the `requiredTags` filter."
      ),
    includeUntaggedResults: booleanEnum
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
    includeTagData: booleanEnum.describe(
      "Set to `true` to include additional tags info in the response"
    ),
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

const outputTag = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().describe("ISO date string"),
  updatedAt: z.string().describe("ISO date string"),
});

export type OutputTag = z.infer<typeof outputTag>;

const outputGameObject = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().describe("ISO date string"),
  updatedAt: z.string().describe("ISO date string"),
  tags: z.array(z.string()).describe("Tag IDs"),
  related: z.array(z.string().describe("Related Game Object IDs")),
});

export type OutputGameObject = z.infer<typeof outputGameObject>;

const output = z.object({
  gameObjects: z.array(outputGameObject),
  tags: z.array(outputTag).optional(),
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

          // If includeUntagged is true, include game objects that have no tags i nthe results
          ...(input?.includeUntaggedResults ? [{ tags: { some: {} } }] : []),

          // If includeTags is specified, only return game objects that have at least one of those tags
          ...(input?.includeTagsFilter && input.includeTagsFilter.length > 0
            ? [
                {
                  tags: {
                    some: {
                      id: {
                        in: input.includeTagsFilter,
                      },
                    },
                  },
                },
              ]
            : []),
          // If excludeTags is specified, exclude game objects that have any of those tags
          ...(input?.excludeTagsFilter && input.excludeTagsFilter.length > 0
            ? [
                {
                  tags: {
                    every: {
                      id: {
                        notIn: input.excludeTagsFilter,
                      },
                    },
                  },
                },
              ]
            : []),
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

    const relatedTagIds = gameObjects.reduce((acc, gameObject) => {
      gameObject.tags.forEach((tag) => acc.add(tag.id));
      return acc;
    }, new Set<string>());

    const additionalTagData = input?.includeTagData
      ? await ctx.prisma.tag.findMany({
          where: {
            id: {
              in: [...relatedTagIds],
            },
          },
        })
      : undefined;

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
      tags: additionalTagData?.map((tag) => ({
        ...tag,
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
      })),
    };
    return processedOutput;
  });

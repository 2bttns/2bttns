import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  commaSeparatedStringToArray,
  paginationSkip,
  paginationTake,
  untaggedFilterEnum,
} from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";
import { booleanEnum } from "./../../../shared/z";

const input = z
  .object({
    take: paginationTake,
    skip: paginationSkip,
    idFilter: commaSeparatedStringToArray
      .describe("Comma-separated Game Object IDs to filter by")
      .optional(),
    allowFuzzyIdFilter: booleanEnum
      .describe(
        "Set to `true` to enable fuzzy ID filtering. If false, only returns exact matches."
      )
      .default(false),
    nameFilter: commaSeparatedStringToArray
      .describe("Comma-separated Game Object names to filter by")
      .optional(),
    allowFuzzyNameFilter: booleanEnum
      .describe(
        "Set to `true` to enable fuzzy name filtering. If false, only returns exact matches."
      )
      .default(false),
    tagFilter: commaSeparatedStringToArray
      .describe(
        "Comma-separated list of tag IDs the resulting game objects must have"
      )
      .optional(),
    tagExcludeFilter: commaSeparatedStringToArray
      .describe(
        "Comma-separated list of tag IDs to exclude from the response. Use this to exclude game objects that have a specific tag, even if they match the `requiredTags` filter."
      )
      .optional(),
    untaggedFilter: untaggedFilterEnum
      .default("include")
      .describe(
        "`include`: Include all game objects, regardless of whether they have tags or not. \n\n`exclude`: Exclude game objects that have no tags. \n\n`untagged-only`: Only return game objects that have no tags. Setting this option will ignore `requiredTags` and `excludeTags`, since tagged items shouldn't appear in the results."
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
      .describe(
        "Comma-separated list of Game Object IDs to exclude from the response"
      )
      .optional(),
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
    const orderBy: Prisma.GameObjectOrderByWithRelationInput = {
      id: input?.sortField === "id" ? input.sortOrder : undefined,
      name: input?.sortField === "name" ? input.sortOrder : undefined,
      description:
        input?.sortField === "description" ? input.sortOrder : undefined,
      tags:
        input?.sortField === "tags" ? { _count: input.sortOrder } : undefined,
      updatedAt: input?.sortField === "updatedAt" ? input.sortOrder : undefined,
      createdAt: input?.sortField === "createdAt" ? input.sortOrder : undefined,
      FromGameObjectRelationship:
        input?.sortField === "related"
          ? { _count: input.sortOrder }
          : undefined,
    };

    const where = getAllWhereInput({
      idFilter: input?.idFilter,
      nameFilter: input?.nameFilter,
      untaggedFilter: input?.untaggedFilter,
      excludeGameObjects: input?.excludeGameObjects,
      allowFuzzyIdFilter: input?.allowFuzzyIdFilter,
      allowFuzzyNameFilter: input?.allowFuzzyNameFilter,
      tagFilter: input?.tagFilter,
      tagExcludeFilter: input?.tagExcludeFilter,
    });

    const gameObjects = await ctx.prisma.gameObject.findMany({
      take: input?.take,
      skip: input?.skip,
      where,
      include: {
        tags: { select: { id: true } },
        FromGameObjectRelationship: { select: { toGameObjectId: true } },
      },
      orderBy,
    });

    // Include tags used by the game objects in the response if requested via the includeTagData flag
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

type Input = NonNullable<z.infer<typeof input>>;

type GetAllWhereInputParams =
  | {
      idFilter?: Input["idFilter"];
      nameFilter?: Input["nameFilter"];
      untaggedFilter?: Input["untaggedFilter"];
      excludeGameObjects?: Input["excludeGameObjects"];
      allowFuzzyIdFilter?: Input["allowFuzzyIdFilter"];
      allowFuzzyNameFilter?: Input["allowFuzzyNameFilter"];
      tagFilter?: Input["tagFilter"];
      tagExcludeFilter?: Input["tagExcludeFilter"];
    }
  | undefined;

export function getAllWhereInput(
  params: GetAllWhereInputParams
): Prisma.GameObjectWhereInput {
  const idFilter = params?.idFilter;
  const nameFilter = params?.nameFilter;
  const untaggedFilter = params?.untaggedFilter;
  const excludeGameObjects = params?.excludeGameObjects;
  const allowFuzzyIdFilter = params?.allowFuzzyIdFilter;
  const allowFuzzyNameFilter = params?.allowFuzzyNameFilter;
  const tagFilter = params?.tagFilter;
  const tagExcludeFilter = params?.tagExcludeFilter;

  return {
    AND: [
      {
        OR: [
          ...(idFilter && allowFuzzyIdFilter
            ? idFilter.map((id) => ({
                id: {
                  contains: id,
                },
              }))
            : idFilter
            ? idFilter.map((id) => ({
                id: {
                  equals: id,
                },
              }))
            : []),

          ...(nameFilter && allowFuzzyNameFilter
            ? nameFilter.map((name) => ({
                name: {
                  contains: name,
                },
              }))
            : nameFilter
            ? nameFilter.map((name) => ({
                name: {
                  equals: name,
                },
              }))
            : []),
        ],
      },
      untaggedFilter === "include"
        ? {
            OR: [
              {
                // Include items that have no tags
                tags: {
                  none: {},
                },
              },
              {
                // Also include items that have tags, but only if they match the `tagFilter` and `tagExcludeFilter` filters
                AND: [
                  {
                    tags: {
                      some: {},
                    },
                  },
                  tagFilter
                    ? {
                        tags: {
                          some: {
                            id: {
                              in: tagFilter,
                            },
                          },
                        },
                      }
                    : {},
                  tagExcludeFilter
                    ? {
                        tags: {
                          none: {
                            id: {
                              in: tagExcludeFilter,
                            },
                          },
                        },
                      }
                    : {},
                ],
              },
            ],
          }
        : {},
      untaggedFilter === "exclude"
        ? {
            AND: [
              // Include only items that have tags
              {
                tags: {
                  some: {},
                },
              },

              // If the `tagFilter` and `tagExcludeFilter` filters are set, we need to add a filter to the query to only return items that match those filters
              // Otherwise, items that have tags but don't match the filters will be included in the response, which is not what we want
              tagExcludeFilter
                ? {
                    tags: {
                      none: {
                        id: {
                          in: tagExcludeFilter,
                        },
                      },
                    },
                  }
                : {},

              tagFilter
                ? {
                    tags: {
                      some: {
                        id: {
                          in: tagFilter,
                        },
                      },
                    },
                  }
                : {},
            ],
          }
        : {},
      // If the untagged-only filter is set, we need to add a filter to the query to only return untagged items
      // This ignores the `tagFilter` and `tagExcludeFilter` filters, since tagged items shouldn't appear in the when this option is set
      untaggedFilter === "untagged-only"
        ? {
            tags: {
              none: {},
            },
          }
        : {},
      {
        // Exclude explicitly excluded items that were specified in the `excludeGameObjects` filter
        id: {
          notIn: excludeGameObjects,
        },
      },
    ],
  };
}

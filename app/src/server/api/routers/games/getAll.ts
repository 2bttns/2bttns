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
      .describe("Comma-separated Game IDs to filter by")
      .optional(),
    allowFuzzyIdFilter: booleanEnum
      .describe(
        "Set to `true` to enable fuzzy ID filtering. If false, only returns exact matches."
      )
      .default(false),
    nameFilter: commaSeparatedStringToArray
      .describe("Comma-separated Game names to filter by")
      .optional(),
    allowFuzzyNameFilter: booleanEnum
      .describe(
        "Set to `true` to enable fuzzy name filtering. If false, only returns exact matches."
      )
      .default(false),
    tagFilter: commaSeparatedStringToArray
      .describe(
        "Comma-separated list of input tag IDs the resulting game must have"
      )
      .optional(),
    tagExcludeFilter: commaSeparatedStringToArray
      .describe(
        "Comma-separated list of input tag IDs to exclude from the response. Use this to exclude games that have a specific input tag, even if they match the `requiredTags` filter."
      )
      .optional(),
    untaggedFilter: untaggedFilterEnum
      .default("include")
      .describe(
        "`include`: Include all games, regardless of whether they have input tags or not. \n\n`exclude`: Exclude games that have no input tags. \n\n`untagged-only`: Only return games that have no input tags. Setting this option will ignore `requiredTags` and `excludeTags`, since tagged items shouldn't appear in the results."
      ),
    sortField: z
      .enum([
        "id",
        "name",
        "description",
        "updatedAt",
        "createdAt",
        "inputTags",
        "mode",
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
    excludeGames: commaSeparatedStringToArray
      .describe("Comma-separated list of Game IDs to exclude from the response")
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

const outputGame = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().describe("ISO date string"),
  updatedAt: z.string().describe("ISO date string"),
  inputTags: z.array(z.string()).describe("Input Tag IDs"),
  mode: z.string(),
});

export type OutputGameObject = z.infer<typeof outputGame>;

const output = z.object({
  games: z.array(outputGame),
  tags: z.array(outputTag).optional(),
});

export const getAll = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get All Games",
      description:
        "Get all Games. Paginated by default. Supports filtering and sorting.",
      tags: [OPENAPI_TAGS.GAMES],
      method: "GET",
      path: "/games",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .query(async ({ ctx, input }) => {
    const orderBy: Prisma.GameOrderByWithRelationInput = {
      id: input?.sortField === "id" ? input.sortOrder : undefined,
      name: input?.sortField === "name" ? input.sortOrder : undefined,
      description:
        input?.sortField === "description" ? input.sortOrder : undefined,
      inputTags:
        input?.sortField === "inputTags"
          ? { _count: input.sortOrder }
          : undefined,
      updatedAt: input?.sortField === "updatedAt" ? input.sortOrder : undefined,
      createdAt: input?.sortField === "createdAt" ? input.sortOrder : undefined,
      mode: input?.sortField === "mode" ? input.sortOrder : undefined,
    };

    const where = getAllWhereInput({
      idFilter: input?.idFilter,
      nameFilter: input?.nameFilter,
      untaggedFilter: input?.untaggedFilter,
      excludeGames: input?.excludeGames,
      allowFuzzyIdFilter: input?.allowFuzzyIdFilter,
      allowFuzzyNameFilter: input?.allowFuzzyNameFilter,
      tagFilter: input?.tagFilter,
      tagExcludeFilter: input?.tagExcludeFilter,
    });

    const games = await ctx.prisma.game.findMany({
      take: input?.take,
      skip: input?.skip,
      where,
      include: {
        inputTags: { select: { id: true } },
      },
      orderBy,
    });

    // Include tags used by the game in the response if requested via the includeTagData flag
    const relatedTagIds = games.reduce((acc, g) => {
      g.inputTags.forEach((tag) => acc.add(tag.id));
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
      games: games.map((g) => ({
        ...g,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
        inputTags: g.inputTags.map((tag) => tag.id) ?? [],
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
      excludeGames?: Input["excludeGames"];
      allowFuzzyIdFilter?: Input["allowFuzzyIdFilter"];
      allowFuzzyNameFilter?: Input["allowFuzzyNameFilter"];
      tagFilter?: Input["tagFilter"];
      tagExcludeFilter?: Input["tagExcludeFilter"];
    }
  | undefined;

export function getAllWhereInput(
  params: GetAllWhereInputParams
): Prisma.GameWhereInput {
  const idFilter = params?.idFilter;
  const nameFilter = params?.nameFilter;
  const untaggedFilter = params?.untaggedFilter;
  const excludeGames = params?.excludeGames;
  const allowFuzzyIdFilter = params?.allowFuzzyIdFilter;
  const allowFuzzyNameFilter = params?.allowFuzzyNameFilter;
  const tagFilter = params?.tagFilter;
  const tagExcludeFilter = params?.tagExcludeFilter;

  const idMode: Prisma.QueryMode = allowFuzzyIdFilter
    ? "insensitive"
    : "default";

  const nameMode: Prisma.QueryMode = allowFuzzyNameFilter
    ? "insensitive"
    : "default";

  return {
    AND: [
      {
        OR: [
          ...(idFilter && allowFuzzyIdFilter
            ? idFilter.map((id) => ({
                id: {
                  contains: id,
                  mode: idMode,
                },
              }))
            : idFilter
            ? idFilter.map((id) => ({
                id: {
                  equals: id,
                  mode: idMode,
                },
              }))
            : []),

          ...(nameFilter && allowFuzzyNameFilter
            ? nameFilter.map((name) => ({
                name: {
                  contains: name,
                  mode: nameMode,
                },
              }))
            : nameFilter
            ? nameFilter.map((name) => ({
                name: {
                  equals: name,
                  mode: nameMode,
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
                inputTags: {
                  none: {},
                },
              },
              {
                // Also include items that have tags, but only if they match the `tagFilter` and `tagExcludeFilter` filters
                AND: [
                  {
                    inputTags: {
                      some: {},
                    },
                  },
                  tagFilter
                    ? {
                        inputTags: {
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
                        inputTags: {
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
                inputTags: {
                  some: {},
                },
              },

              // If the `tagFilter` and `tagExcludeFilter` filters are set, we need to add a filter to the query to only return items that match those filters
              // Otherwise, items that have tags but don't match the filters will be included in the response, which is not what we want
              tagExcludeFilter
                ? {
                    inputTags: {
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
                    inputTags: {
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
            inputTags: {
              none: {},
            },
          }
        : {},
      {
        // Exclude explicitly excluded items that were specified in the `excludeGames` filter
        id: {
          notIn: excludeGames,
        },
      },
    ],
  };
}

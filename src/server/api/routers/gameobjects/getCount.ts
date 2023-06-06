import { z } from "zod";
import {
  commaSeparatedStringToArray,
  untaggedFilterEnum,
} from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z
  .object({
    idFilter: commaSeparatedStringToArray
      .describe("Comma-separated Game Object IDs to filter by")
      .optional(),
    nameFilter: commaSeparatedStringToArray
      .describe("Comma-separated Game Object names to filter by")
      .optional(),
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
    excludeGameObjects: commaSeparatedStringToArray
      .describe(
        "Comma-separated list of Game Object IDs to exclude from the response"
      )
      .optional(),
  })
  .optional();

const output = z.object({
  count: z.number().min(0),
});

export const getCount = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get Game Object Count",
      description: "Get the total Game Object count. Supports filtering.",
      tags: [OPENAPI_TAGS.GAME_OBJECTS],
      method: "GET",
      path: "/game-objects/count",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .query(async ({ ctx, input }) => {
    const count = await ctx.prisma.gameObject.count({
      where: {
        AND: [
          {
            OR: [
              ...(input?.idFilter
                ? input.idFilter.map((id) => ({
                    id: {
                      contains: id,
                    },
                  }))
                : []),

              ...(input?.nameFilter
                ? input.nameFilter.map((name) => ({
                    name: {
                      contains: name,
                    },
                  }))
                : []),
            ],
          },
          input?.untaggedFilter === "include"
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
                      input?.tagFilter
                        ? {
                            tags: {
                              some: {
                                id: {
                                  in: input?.tagFilter,
                                },
                              },
                            },
                          }
                        : {},
                      input?.tagExcludeFilter
                        ? {
                            tags: {
                              none: {
                                id: {
                                  in: input?.tagExcludeFilter,
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
          input?.untaggedFilter === "exclude"
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
                  input?.tagExcludeFilter
                    ? {
                        tags: {
                          none: {
                            id: {
                              in: input?.tagExcludeFilter,
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
          input?.untaggedFilter === "untagged-only"
            ? {
                tags: {
                  none: {},
                },
              }
            : {},
          {
            // Exclude explicitly excluded items that were specified in the `excludeGameObjects` filter
            id: {
              notIn: input?.excludeGameObjects,
            },
          },
        ],
      },
    });
    return { count };
  });

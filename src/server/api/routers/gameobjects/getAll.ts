import { z } from "zod";
import {
  paginationSkip,
  paginationTake,
  sort,
  tagFilter,
  textFilter,
} from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const getAll = adminOrApiKeyProtectedProcedure
  .input(
    z
      .object({
        take: paginationTake,
        skip: paginationSkip,
        filter: z
          .object({
            mode: z.enum(["AND", "OR"]).optional(),
            id: textFilter.optional(),
            name: textFilter.optional(),
            tag: tagFilter.optional(),
          })
          .optional(),
        includeTags: z.boolean().optional().default(false),
        sort: z
          .object({
            id: sort.optional(),
            name: sort.optional(),
            description: sort.optional(),
            tags: sort.optional(),
            updatedAt: sort.optional(),
          })
          .optional(),
        excludeGameObjects: z.array(z.string()).optional().default([]),
        includeOutgoingRelationships: z.boolean().optional().default(false),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const gameObjects = await ctx.prisma.gameObject.findMany({
      take: input?.take,
      skip: input?.skip,
      where: {
        AND: [
          {
            [input?.filter?.mode ?? "AND"]: input?.filter?.mode
              ? [
                  {
                    id: {
                      in: input?.filter?.id?.in,
                      contains: input?.filter?.id?.contains,
                    },
                  },
                  {
                    name: {
                      in: input?.filter?.name?.in,
                      contains: input?.filter?.name?.contains,
                    },
                  },
                ]
              : undefined,
          },
          input?.filter?.tag
            ? {
                OR: [
                  {
                    AND: [
                      {
                        tags: {
                          some: {
                            id: {
                              in: input?.filter?.tag?.include,
                            },
                          },
                        },
                      },
                      {
                        tags: {
                          none: {
                            id: {
                              in: input?.filter?.tag?.exclude,
                            },
                          },
                        },
                      },
                    ],
                  },
                  {
                    tags: {
                      none: input?.filter?.tag?.includeUntagged
                        ? {}
                        : undefined,
                    },
                  },
                ],
              }
            : {},
          {
            id: {
              notIn: input?.excludeGameObjects,
            },
          },
        ],
      },
      include: {
        tags: input?.includeTags,
        // TODO: Include related game objects
        FromGameObjectRelationship: input?.includeOutgoingRelationships,
      },
      orderBy: {
        id: input?.sort?.id,
        name: input?.sort?.name,
        description: input?.sort?.description,
        tags: input?.sort?.tags
          ? {
              _count: input.sort.tags,
            }
          : undefined,
        updatedAt: input?.sort?.updatedAt,
      },
    });
    return { gameObjects };
  });

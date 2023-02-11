import { z } from "zod";
import { sort, tagFilter, textFilter } from "../../../shared/z";
import { publicProcedure } from "../../trpc";

export const getAll = publicProcedure
  .input(
    z
      .object({
        take: z.number().optional().default(10),
        skip: z.number().optional(),
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
            inputTags: sort.optional(),
            updatedAt: sort.optional(),
          })
          .optional(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const games = await ctx.prisma.game.findMany({
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
                        inputTags: {
                          some: {
                            id: {
                              in: input?.filter?.tag?.include,
                            },
                          },
                        },
                      },
                      {
                        inputTags: {
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
                    inputTags: {
                      none: input?.filter?.tag?.includeUntagged
                        ? {}
                        : undefined,
                    },
                  },
                ],
              }
            : {},
        ],
      },
      include: {
        inputTags: input?.includeTags,
      },
      orderBy: {
        id: input?.sort?.id,
        name: input?.sort?.name,
        description: input?.sort?.description,
        inputTags: input?.sort?.inputTags
          ? {
              _count: input.sort.inputTags,
            }
          : undefined,
        updatedAt: input?.sort?.updatedAt,
      },
    });
    return { games };
  });

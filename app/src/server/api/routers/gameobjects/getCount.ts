import { z } from "zod";
import { tagFilter, textFilter } from "../../../shared/z";
import { publicProcedure } from "../../trpc";

export const getCount = publicProcedure
  .input(
    z
      .object({
        filter: z
          .object({
            mode: z.enum(["AND", "OR"]).optional(),
            id: textFilter.optional(),
            name: textFilter.optional(),
            tag: tagFilter.optional(),
          })
          .optional(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const count = await ctx.prisma.gameObject.count({
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
        ],
      },
    });

    return { count };
  });

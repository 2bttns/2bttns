import { z } from "zod";
import { publicProcedure } from "../../trpc";

const filter = z.object({
  in: z.array(z.string()).optional(),
  contains: z.string().optional(),
});

const tagFilter = z.object({
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
  includeUntagged: z.boolean().optional().default(false),
});

export const getCount = publicProcedure
  .input(
    z
      .object({
        filter: z
          .object({
            mode: z.enum(["AND", "OR"]).optional(),
            id: filter.optional(),
            name: filter.optional(),
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

import { z } from "zod";
import { publicProcedure } from "../../trpc";

const filter = z.object({
  in: z.array(z.string()).optional(),
  contains: z.string().optional(),
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
            tag: filter.optional(),
          })
          .optional(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const count = await ctx.prisma.gameObject.count({
      where: {
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
              {
                tags: {
                  some: {
                    name: {
                      in: input?.filter?.tag?.in,
                      contains: input?.filter?.tag?.contains,
                    },
                  },
                },
              },
            ]
          : undefined,
      },
    });

    return { count };
  });

import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getCount = publicProcedure
  .input(
    z
      .object({
        filter: z
          .object({
            id: z.array(z.string()).optional(),
            name: z.array(z.string()).optional(),
            tag: z.array(z.string()).optional(),
          })
          .optional(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const count = await ctx.prisma.gameObject.count({
      where: {
        id: input?.filter?.id && {
          in: input?.filter?.id,
        },
        name: input?.filter?.name && {
          in: input?.filter?.name,
        },
        tags: input?.filter?.tag && {
          some: {
            id: {
              in: input?.filter?.tag,
            },
          },
        },
      },
    });

    return { count };
  });

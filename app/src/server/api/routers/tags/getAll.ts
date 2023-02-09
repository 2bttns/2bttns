import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getAll = publicProcedure
  .input(
    z
      .object({
        id: z.array(z.string()).optional(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const tags = await ctx.prisma.tag.findMany({
      where: {
        id: input?.id
          ? {
              in: input?.id,
            }
          : undefined,
      },
    });
    return { tags };
  });

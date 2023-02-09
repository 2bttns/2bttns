import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getById = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const tag = await ctx.prisma.tag.findFirst({
      where: {
        id: input.id,
      },
    });

    return { tag };
  });

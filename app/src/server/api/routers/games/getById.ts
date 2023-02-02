import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getById = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const game = await ctx.prisma.game.findFirst({
      where: {
        id: input.id,
      },
    });

    if (!game) {
      throw new Error(`Game with id ${input.id} not found`);
    }

    return { game };
  });

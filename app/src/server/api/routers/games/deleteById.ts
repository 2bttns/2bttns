import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const deleteById = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const deletedGame = await ctx.prisma.game.delete({
      where: {
        id: input.id,
      },
    });
    return { deletedGame };
  });

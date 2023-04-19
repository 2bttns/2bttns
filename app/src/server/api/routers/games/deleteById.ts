import { z } from "zod";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const deleteById = adminOrApiKeyProtectedProcedure
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

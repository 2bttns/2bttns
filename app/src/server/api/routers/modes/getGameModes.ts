import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getGameModes = publicProcedure
  .input(
    z.object({
      gameId: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { gameId } = input;

    const gameModes = await ctx.prisma.gameMode.findMany({
      where: {
        gameId,
      },
    });

    return { gameModes };
  });

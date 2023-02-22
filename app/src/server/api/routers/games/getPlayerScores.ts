import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getPlayerScores = publicProcedure
  .input(
    z.object({
      game_id: z.string(),
      player_id: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const gameTags = await ctx.prisma.tag.findMany({
      where: {
        inputToGames: {
          some: {
            id: input.game_id,
          },
        },
      },
    });

    const gameObjects = await ctx.prisma.gameObject.findMany({
      where: {
        tags: {
          some: {
            id: {
              in: gameTags.map((tag) => tag.id),
            },
          },
        },
      },
    });

    const playerScores = await ctx.prisma.playerScore.findMany({
      where: {
        gameObjectId: {
          in: gameObjects.map((gameObject) => gameObject.id),
        },
        playerId: input.player_id,
      },
      orderBy: {
        score: "desc",
      },
    });

    return {
      playerScores,
    };
  });

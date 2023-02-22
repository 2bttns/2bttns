import { PlayerScore } from "@prisma/client";
import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const upsertPlayerScore = publicProcedure
  .input(
    z.object({
      playerId: z.string(),
      gameObjectId: z.string(),
      score: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const player = await ctx.prisma.player.findUnique({
      where: {
        id: input.playerId,
      },
    });

    if (!player) {
      await ctx.prisma.player.create({
        data: {
          id: input.playerId,
        },
      });
    }

    const gameObject = await ctx.prisma.gameObject.findUnique({
      where: {
        id: input.gameObjectId,
      },
    });

    if (!gameObject) {
      throw new Error("GameObject not found");
    }

    const existingPlayerScore: PlayerScore | null =
      await ctx.prisma.playerScore.findUnique({
        where: {
          playerId_gameObjectId: {
            playerId: input.playerId,
            gameObjectId: input.gameObjectId,
          },
        },
      });

    const playerScore = await ctx.prisma.playerScore.upsert({
      where: {
        playerId_gameObjectId: {
          playerId: input.playerId,
          gameObjectId: input.gameObjectId,
        },
      },
      update: {
        score: existingPlayerScore!.score.toNumber() + input.score,
      },
      create: {
        player: {
          connect: {
            id: input.playerId,
          },
        },
        gameObject: {
          connect: {
            id: input.gameObjectId,
          },
        },
        score: input.score,
      },
    });

    return {
      playerScore,
    };
  });

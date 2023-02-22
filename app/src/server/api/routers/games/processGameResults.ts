import { GameObject, PlayerScore } from "@prisma/client";
import { z } from "zod";
import { publicProcedure } from "../../trpc";
import { prisma } from "./../../../db";

const choiceItemSchema = z.object({
  gameObjectId: z.string(),
});
const userChoiceSchema = z.object({
  picked: choiceItemSchema,
  not_picked: choiceItemSchema,
});

export const processGameResults = publicProcedure
  .input(
    z.object({
      playerId: z.string(),
      results: z.array(userChoiceSchema),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { results } = input;

    const player = await ctx.prisma.player.findUnique({
      where: {
        id: input.playerId,
      },
    });

    if (!player) {
      await prisma.player.create({
        data: {
          id: input.playerId,
        },
      });
    }

    const gameObjectIdsInvolved = new Set<string>();
    results.forEach((choice) => {
      gameObjectIdsInvolved.add(choice.picked.gameObjectId);
      gameObjectIdsInvolved.add(choice.not_picked.gameObjectId);
    });

    const gameObjectsInvolved = await ctx.prisma.gameObject.findMany({
      where: {
        id: {
          in: Array.from(gameObjectIdsInvolved),
        },
      },
    });

    const existingPlayerScores = await ctx.prisma.playerScore.findMany({
      where: {
        gameObjectId: {
          in: Array.from(gameObjectIdsInvolved),
        },
        playerId: input.playerId,
      },
    });
    const existingPlayerScoresMap = new Map<GameObject["id"], PlayerScore>();
    existingPlayerScores.forEach((playerScore) => {
      existingPlayerScoresMap.set(playerScore.gameObjectId, playerScore);
    });

    const scoresMap = new Map<GameObject["id"], number>();
    gameObjectsInvolved.forEach((gameObject) => {
      const existingPlayerScore = existingPlayerScoresMap.get(gameObject.id);
      scoresMap.set(gameObject.id, existingPlayerScore?.score.toNumber() ?? 0);
    });

    const winnerScoreBonus = 1;
    results.forEach((choice) => {
      const { picked, not_picked } = choice;

      const pickedScore = scoresMap.get(picked.gameObjectId)!;
      const notPickedScore = scoresMap.get(not_picked.gameObjectId)!;

      const updatedWinnerScore =
        pickedScore + winnerScoreBonus + notPickedScore;
      scoresMap.set(picked.gameObjectId, updatedWinnerScore);
    });

    const upsertedPlayerScores = await prisma.$transaction([
      ...Array.from(scoresMap.entries()).map(([gameObjectId, score]) => {
        const existingPlayerScore = existingPlayerScoresMap.get(gameObjectId);
        if (existingPlayerScore) {
          return prisma.playerScore.update({
            where: {
              playerId_gameObjectId: {
                playerId: input.playerId,
                gameObjectId,
              },
            },
            data: {
              score,
            },
          });
        } else {
          return prisma.playerScore.create({
            data: {
              player: {
                connect: {
                  id: input.playerId,
                },
              },
              gameObject: {
                connect: {
                  id: gameObjectId,
                },
              },
              score,
            },
          });
        }
      }),
    ]);

    return { upsertedPlayerScores };
  });

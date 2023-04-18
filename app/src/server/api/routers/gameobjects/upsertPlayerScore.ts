import { GameObjectRelationship, PlayerScore, Weight } from "@prisma/client";
import { z } from "zod";
import normalizeScores from "../../../shared/normalizeScores";
import { anyAuthProtectedProcedure } from "../../trpc";

export const upsertPlayerScore = anyAuthProtectedProcedure
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

    const existingPlayerScoreObject: PlayerScore | null =
      await ctx.prisma.playerScore.findUnique({
        where: {
          playerId_gameObjectId: {
            playerId: input.playerId,
            gameObjectId: input.gameObjectId,
          },
        },
      });

    const existingPlayerScore =
      existingPlayerScoreObject?.score.toNumber() ?? 0;

    const targetGameObject = await ctx.prisma.gameObject.findFirst({
      where: {
        FromGameObjectRelationship: {
          some: {
            fromGameObjectId: input.gameObjectId,
          },
        },
      },
      include: {
        FromGameObjectRelationship: {
          include: {
            weight: true,
          },
        },
      },
    });

    const relationships: (GameObjectRelationship & {
      weight: Weight;
    })[] = targetGameObject?.FromGameObjectRelationship ?? [];

    await ctx.prisma.$transaction([
      ctx.prisma.playerScore.upsert({
        where: {
          playerId_gameObjectId: {
            playerId: input.playerId,
            gameObjectId: input.gameObjectId,
          },
        },
        update: {
          score: existingPlayerScore + input.score,
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
      }),
      ...relationships.map((relationship) => {
        const updatedRelationshipsScore =
          relationship.weight.weight.toNumber() * input.score;

        return ctx.prisma.playerScore.upsert({
          where: {
            playerId_gameObjectId: {
              playerId: input.playerId,
              gameObjectId: relationship.toGameObjectId,
            },
          },

          update: {
            score: updatedRelationshipsScore,
          },
          create: {
            player: {
              connect: {
                id: input.playerId,
              },
            },
            gameObject: {
              connect: {
                id: relationship.toGameObjectId,
              },
            },
            score: updatedRelationshipsScore,
          },
        });
      }),
    ]);

    const { allPlayerScoresNormalized } = await normalizeScores(input.playerId);

    const resultScores = allPlayerScoresNormalized.filter(
      (score) =>
        score.gameObjectId === input.gameObjectId ||
        relationships.some(
          (relationship) => relationship.toGameObjectId === score.gameObjectId
        )
    );

    return {
      resultScores,
    };
  });

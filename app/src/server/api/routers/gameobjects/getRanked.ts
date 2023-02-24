import {
  GameObject,
  GameObjectRelationship,
  PlayerScore,
  Weight,
} from "@prisma/client";
import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getRanked = publicProcedure
  .input(
    z.object({
      playerId: z.string(),
      outputTags: z.array(z.string()),
      inputTags: z.array(z.string()),
    })
  )
  .query(async ({ ctx, input }) => {
    const outputGameObjects = await ctx.prisma.gameObject.findMany({
      where: {
        tags: {
          some: {
            id: {
              in: input?.outputTags,
            },
          },
        },
      },
    });

    const outputGameObjectIds = outputGameObjects.map(
      (gameObject) => gameObject.id
    );

    const playerScores = await ctx.prisma.playerScore.findMany({
      where: {
        playerId: input.playerId,
        gameObject: {
          tags: {
            some: {
              id: {
                in: input?.inputTags,
              },
            },
          },
          FromGameObjectRelationship: {
            some: {
              toGameObjectId: {
                in: outputGameObjectIds,
              },
            },
          },
        },
      },
      include: {
        gameObject: true,
      },
      orderBy: {
        score: "desc",
      },
    });

    const outputRelationships =
      await ctx.prisma.gameObjectRelationship.findMany({
        where: {
          toGameObjectId: {
            in: outputGameObjectIds,
          },
        },
        include: {
          weight: true,
          toGameObject: true,
        },
      });

    const rankedOutputsMap = new Map<
      GameObject["id"],
      {
        gameObject: GameObject;
        score: number;
      }
    >();
    outputRelationships.forEach(
      (
        relationship: GameObjectRelationship & {
          weight: Weight;
          toGameObject: GameObject;
        }
      ) => {
        const playerScore = playerScores.find(
          (playerScore) =>
            playerScore.gameObjectId === relationship.fromGameObjectId
        ) as
          | (PlayerScore & {
              gameObject: GameObject;
            })
          | undefined;

        let score =
          rankedOutputsMap.get(relationship.toGameObject.id)?.score ?? 0;
        if (playerScore) {
          const toAdd =
            playerScore.score.toNumber() *
            relationship.weight.weight.toNumber();
          score += toAdd;
          console.log(relationship.toGameObject.name, toAdd);
        }
        rankedOutputsMap.set(relationship.toGameObject.id, {
          gameObject: relationship.toGameObject,
          score,
        });
      }
    );

    outputGameObjects.forEach((gameObject: GameObject) => {
      if (rankedOutputsMap.has(gameObject.id)) return;
      rankedOutputsMap.set(gameObject.id, {
        gameObject,
        score: 0,
      });
    });

    const rankedOutputs = Array.from(rankedOutputsMap.entries())
      .map(([gameObjectId, { gameObject, score }]) => ({
        gameObjectId,
        name: gameObject.name,
        gameObject,
        score,
      }))
      .sort((a, b) => b.score - a.score);

    return { rankedOutputs, outputRelationships, playerScores };
  });

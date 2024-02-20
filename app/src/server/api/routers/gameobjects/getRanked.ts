import type { PlayerScore, GameObject } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../../../db";
import { idSchema } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  playerId: idSchema,
  inputTags: z
    .string()
    .describe(
      "Specify comma-separated input tags that will be used to score the game objects associated with the output tag.\n\nIf the output tag is included in the input tags, the player's score for those game object will be used as base scores"
    ),
  outputTag: z
    .string()
    .describe(
      "Specify the output tag of the game objects to get ranked results for"
    ),
});

const output = z.object({
  scores: z.array(
    z.object({
      gameObject: z.object({
        id: z.string(),
        name: z.string(),
      }),
      score: z.number(),
    })
  ),
});

export const getRanked = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get Ranked Results",
      description: "Get ranked Game Object results for a player",
      tags: [OPENAPI_TAGS.GAME_OBJECTS],
      method: "GET",
      path: "/game-objects/ranked",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .query(async ({ ctx, input }) => {
    await validate(input);

    const playerScores = await ctx.prisma.playerScore.findMany({
      where: {
        playerId: input.playerId,
        gameObject: {
          tags: {
            some: {
              id: input.outputTag,
            },
          },
        },
      },
      select: {
        score: true,
        gameObject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        score: "desc",
      },
    });

    const doScoreSelf = input.inputTags.includes(input.outputTag);

    const playerScoreMap = new Map<string, (typeof playerScores)[0]>();
    for (const { gameObject, score } of playerScores) {
      const baseScore = doScoreSelf ? score : new Decimal(0);
      playerScoreMap.set(gameObject.id, {
        gameObject,
        score: baseScore,
      });
    }

    const unscoredGameObjects = await ctx.prisma.gameObject.findMany({
      where: {
        tags: {
          some: {
            id: input.outputTag,
          },
        },
        NOT: {
          id: {
            in: [...playerScoreMap.keys()],
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    for (const gameObject of unscoredGameObjects) {
      playerScoreMap.set(gameObject.id, {
        gameObject,
        score: new Decimal(0),
      });
    }

    const relationships: {
      weight: {
        weight: Decimal;
      };
      fromGameObject: {
        PlayerScore: PlayerScore[];
      };
      toGameObjectId: GameObject["id"];
    }[] = await ctx.prisma.gameObjectRelationship.findMany({
      where: {
        fromGameObject: {
          tags: {
            some: {
              id: { in: input.inputTags.split(",") },
            },
          },
        },
        toGameObjectId: {
          in: Array.from(playerScoreMap.keys()),
        },
      },
      select: {
        weight: {
          select: {
            weight: true,
          },
        },
        fromGameObject: {
          select: {
            PlayerScore: {
              where: {
                playerId: input.playerId,
              },
            },
          },
        },
        toGameObjectId: true,
      },
    });

    relationships.forEach((relationship) => {
      const score = playerScoreMap.get(relationship.toGameObjectId);
      if (!score) return;

      const inputGameObjectScore =
        relationship.fromGameObject.PlayerScore[0]?.score.toNumber() ?? 0;
      const weight = relationship.weight.weight.toNumber();
      const weightedScore = inputGameObjectScore * weight;
      score.score = score.score.plus(weightedScore);
    });

    const scores = [...playerScoreMap.values()]
      .map(({ gameObject, score }) => ({
        gameObject,
        score: score.toNumber(),
      }))
      .sort((a, b) => b.score - a.score);

    return { scores };
  });

async function validate(inputData: z.infer<typeof input>) {
  const player = await prisma.player.findUnique({
    where: {
      id: inputData.playerId,
    },
  });
  if (!player) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Player not found: "${inputData.playerId}"`,
    });
  }

  const inputTagIds = inputData.inputTags.split(",");
  const hasDuplicateInputTags =
    new Set(inputTagIds).size !== inputTagIds.length;
  if (hasDuplicateInputTags) {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    inputTagIds.forEach((tag) => {
      if (seen.has(tag)) {
        duplicates.add(tag);
        return;
      }

      seen.add(tag);
    });

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Duplicate input tag(s): ${[...duplicates]
        .map((t) => `"${t}"`)
        .join(", ")}`,
    });
  }

  const inputTags = await prisma.tag.findMany({
    where: {
      id: {
        in: inputTagIds,
      },
    },
  });

  if (inputTags.length !== inputTagIds.length) {
    const missingTags = inputTagIds.filter(
      (inputTag) => !inputTags.some((tag) => tag.id === inputTag)
    );
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Input tags not found: ${missingTags
        .map((t) => `"${t}"`)
        .join(", ")}`,
    });
  }

  const tags = await prisma.tag.findUnique({
    where: {
      id: inputData.outputTag,
    },
  });

  if (!tags) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Output tag not found: "${inputData.outputTag}"`,
    });
  }
}

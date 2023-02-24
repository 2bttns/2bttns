import { Decimal } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../../../db";
import { publicProcedure } from "../../trpc";

export const getRanked = publicProcedure
  .input(
    z.object({
      playerId: z.string(),
      inputTags: z.array(z.string()),
      outputTag: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const player = await prisma.player.findUnique({
      where: {
        id: input.playerId,
      },
    });
    if (!player) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Player not found: "${input.playerId}"`,
      });
    }

    const inputTags = await prisma.tag.findMany({
      where: {
        id: {
          in: input.inputTags,
        },
      },
    });

    if (inputTags.length !== input.inputTags.length) {
      const missingTags = input.inputTags.filter(
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
        id: input.outputTag,
      },
    });

    if (!tags) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Output tag not found: "${input.outputTag}"`,
      });
    }

    // TODO: Weight output rankings based on input tag weights
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

    const playerScoreMap = new Map<string, typeof playerScores[0]>();
    for (const { gameObject, score } of playerScores) {
      playerScoreMap.set(gameObject.id, {
        gameObject,
        score,
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

    const results = [...playerScoreMap.values()]
      .map(({ gameObject, score }) => ({
        gameObject,
        score: score.toNumber(),
      }))
      .sort((a, b) => b.score - a.score);

    return { results };
  });

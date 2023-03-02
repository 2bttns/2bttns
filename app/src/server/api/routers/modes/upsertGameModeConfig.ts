import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { availableModes } from "../../../../modes/modesUIRegistry";
import { publicProcedure } from "../../trpc";

export const upsertGameModeConfig = publicProcedure
  .input(
    z.object({
      gameId: z.string(),
      mode: z.enum(availableModes),
      configJson: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { gameId, mode, configJson } = input;

    try {
      JSON.parse(configJson);
    } catch (e) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid JSON",
        cause: e,
      });
    }

    try {
      await ctx.prisma.game.findUniqueOrThrow({
        where: {
          id: gameId,
        },
      });
    } catch (e) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid game ID",
        cause: e,
      });
    }

    const gameMode = await ctx.prisma.gameMode.findFirst({
      where: {
        gameId: gameId,
        modeId: mode,
      },
    });

    let existingConfig: Object;

    try {
      existingConfig = gameMode?.modeConfigJson
        ? JSON.parse(gameMode.modeConfigJson)
        : {};
    } catch {
      existingConfig = {};
    }

    const nextJsonConfig = JSON.stringify({
      ...existingConfig,
      ...JSON.parse(configJson),
    });

    await ctx.prisma.gameMode.upsert({
      where: {
        gameId_modeId: {
          gameId: gameId,
          modeId: mode,
        },
      },
      update: {
        modeConfigJson: nextJsonConfig,
      },
      create: {
        gameId: gameId,
        modeId: mode,
        modeConfigJson: nextJsonConfig,
      },
    });
  });

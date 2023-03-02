import { GameMode } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter } from "../server/api/trpc";
import { publicProcedure } from "./../server/api/trpc";
import { classicModeRouter } from "./classic/backend/_index";
import { availableModes } from "./modesUIRegistry";

// TODO: TRPC procedure to resolve mode UI props
// When done, pass the result to the Play page's PlayMode component
const getGameModeConfig = publicProcedure
  .input(
    z.object({
      gameId: z.string(),
      mode: z.enum(availableModes),
    })
  )
  .query(async ({ ctx, input }) => {
    const { gameId, mode } = input;
    let gameMode: GameMode | null = null;
    try {
      gameMode = await ctx.prisma.gameMode.findUniqueOrThrow({
        where: {
          gameId_modeId: {
            gameId: gameId,
            modeId: mode,
          },
        },
      });
    } catch (e) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Game mode not found",
        cause: e,
      });
    }
    const gameModeConfig = gameMode.modeConfigJson
      ? JSON.parse(gameMode!.modeConfigJson)
      : {};

    return { gameModeConfig };
  });

const upsertGameModeConfig = publicProcedure
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

export const modesRouter = createTRPCRouter({
  getGameModeConfig,
  upsertGameModeConfig,
  classicMode: classicModeRouter,
  // Register additional mode backend routers here
});

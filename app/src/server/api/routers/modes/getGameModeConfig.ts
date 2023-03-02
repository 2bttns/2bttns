// TODO: TRPC procedure to resolve mode UI props

import { GameMode } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { availableModes } from "../../../../modes/availableModes";
import { publicProcedure } from "../../trpc";

export const getGameModeConfig = publicProcedure
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

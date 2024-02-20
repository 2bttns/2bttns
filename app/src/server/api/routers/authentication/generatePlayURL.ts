import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  app_id: z.string().describe("ID of the app you've created in 2bttns"),
  secret: z.string().describe("Secret of the app you've created in 2bttns"),
  game_id: z.string().describe("ID of the game you want to play in 2bttns"),
  player_id: z
    .string()
    .describe(
      "ID of the player you want to play in 2bttns. If the player doesn't already exist, it will be created."
    ),
  num_items: z
    .string()
    .describe("Number of items that should appear in the game round"),
  callback_url: z
    .string()
    .optional()
    .describe("URL to redirect the player to after finishing the game round"),
  expires_in: z
    .string()
    .optional()
    .describe("Expiration time of the generated play URL"),
});

export const generatePlayURL = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Generate play URL",
      description: `Returns a URL you can use to send a user to play a game in 2bttns.`,
      tags: [OPENAPI_TAGS.AUTHENTICATION],
      method: "GET",
      path: "/authentication/generatePlayURL",
      protect: true,
    },
  })
  .input(input)
  .output(z.string())
  .query(async ({ ctx, input }) => {
    if (!ctx.headers?.host) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Host header not found",
      });
    }

    if (
      input.callback_url &&
      !input.callback_url?.startsWith("http://") &&
      !input.callback_url?.startsWith("https://")
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Callback URL must start with http:// or https://",
      });
    }

    try {
      const appSecret = await ctx.prisma.secret.findFirstOrThrow({
        where: {
          id: input.app_id,
        },
      });
      if (appSecret.secret !== input.secret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid app_id or secret`,
        });
      }
    } catch (e) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Invalid app_id or secret`,
      });
    }

    const {
      app_id: appId,
      secret,
      game_id: gameId,
      player_id: playerId,
      num_items: numItems,
      callback_url: callbackUrl,
      expires_in: expiresIn,
    } = input;

    try {
      const playerToken = jwt.sign(
        { type: "player_token", appId, playerId },
        secret,
        {
          expiresIn: expiresIn ?? "1h",
        }
      );

      const queryBuilder = new URLSearchParams();
      queryBuilder.append("game_id", gameId);
      queryBuilder.append("app_id", appId);
      queryBuilder.append("jwt", playerToken);
      if (numItems) {
        queryBuilder.append("num_items", numItems.toString());
      }

      if (callbackUrl) {
        queryBuilder.append("callback_url", callbackUrl);
      }
      return `${ctx.headers?.host}/play?${queryBuilder.toString()}`;
    } catch (e) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Error generating play URL: ${(e as Error).message}`,
      });
    }
  });

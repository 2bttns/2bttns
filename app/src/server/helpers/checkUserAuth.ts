import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { CreateContextOptions } from "../api/trpc";
import isAdmin from "../shared/isAdmin";
import { logger } from "./logger";

const jwtBaseSchema = z.object({
  sub: z.string().optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export const twobttnsBaseJwtSchema = z
  .object({
    appId: z.string(),
  })
  .merge(jwtBaseSchema);

export const playerTokenSchema = z
  .object({
    type: z.literal("player_token"),
    playerId: z.string(),
  })
  .merge(twobttnsBaseJwtSchema);

export const apiKeyTokenSchema = z
  .object({
    type: z.literal("api_key_token"),
  })
  .merge(twobttnsBaseJwtSchema);

export const tokenSchema = z.union([playerTokenSchema, apiKeyTokenSchema]);

export type CheckUserAuthData =
  | z.infer<typeof tokenSchema>
  | { type: "admin_session" };

export async function checkUserAuth(
  ctx: CreateContextOptions
): Promise<CheckUserAuthData> {
  // Allow the user access if they have a valid Authorization header
  // The Authorization token can represent one of the following:
  //  1. player_token - Player ID encoded in a JWT; used when a player is bounced from to a 2bttns game
  //      A Bearer token Authorization header is automatically sent when `playerToken` is set in frontend code via `setPlayerToken()`
  //  2. api_key_token - API Key encoded in a JWT; used by client apps to access the 2bttns API
  //      The 2bttns SDK should automatically pass the API key Bearer token as an Authorization header when making API calls
  logger.silly("checkUserAuth - start");

  const authHeader = ctx.headers?.authorization;
  logger.info(`checkUserAuth - Received authHeader: ${authHeader}`);

  const token = authHeader?.split(" ")[1];
  if (token) {
    const decoded = jwt.decode(token);
    if (!decoded) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid token",
      });
    }
    logger.info(`checkUserAuth - decoded token: ${JSON.stringify(decoded)}`);

    const tokenData = tokenSchema.parse(decoded);

    const correspondingSecret = await ctx.prisma?.secret.findFirst({
      where: {
        id: tokenData.appId,
      },
      select: { secret: true },
    });

    if (!correspondingSecret) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid token app_id",
      });
    }

    try {
      jwt.verify(token, correspondingSecret.secret);
    } catch {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Invalid token -- app_id: ${tokenData.appId} could not be verified with its corresponding secret`,
      });
    }

    if (tokenData.type) {
      logger.silly("checkUserAuth - end (valid token found)");
      return tokenData;
    }
  }

  // Otherwise, check if the user has a current session

  // In the 2bttns admin panel, "user" refers to the admin user, not the end user
  //  (end users don't log in to the admin panel; when they play a game they are referred to as "players")
  const isAdminType = ctx.session && ctx.session.user;
  if (isAdminType) {
    // Ensure the user is an admin
    // Even if they have a session, ensure their access is still valid via the admin allow list database table
    // For example, the admin user may have been deleted from the allow list while they were still logged in
    if (
      !ctx.session?.user?.email ||
      !(await isAdmin({
        email: ctx.session.user.email,
        userId: ctx.session.user.id,
        clearSessionsIfNotFound: true,
      }))
    ) {
      logger.silly("checkUserAuth - end (UNAUTHORIZED)");
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource",
      });
    }

    logger.silly("checkUserAuth - end (admin session found)");
    return { type: "admin_session" };
  }

  // Otherwise, they are not authorized
  logger.silly("checkUserAuth - end (UNAUTHORIZED)");
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "You are not authorized to access this resource",
  });
}

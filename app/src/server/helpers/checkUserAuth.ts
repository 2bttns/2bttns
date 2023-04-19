import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { CreateContextOptions } from "../api/trpc";

const jwtBaseSchema = z.object({
  sub: z.string().optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

const twobttnsBaseJwtSchema = z
  .object({
    appId: z.string(),
  })
  .merge(jwtBaseSchema);

const playerTokenSchema = z
  .object({
    type: z.literal("player_token"),
    userId: z.string(),
  })
  .merge(twobttnsBaseJwtSchema);

const apiKeyTokenSchema = z
  .object({
    type: z.literal("api_key_token"),
  })
  .merge(twobttnsBaseJwtSchema);

const tokenSchema = z.union([playerTokenSchema, apiKeyTokenSchema]);

export type CheckUserAuthData =
  | z.infer<typeof tokenSchema>
  | { type: "admin_session" };

export async function checkUserAuth(
  ctx: CreateContextOptions
): Promise<CheckUserAuthData> {
  // Allow the user access if they have a valid Authorization header
  // The Authorization token can represent one of the following:
  //  1. player_token - Player ID encoded in a JWT; used when a player is bounced from to a 2bttns game
  //  2. api_key_token - API Key encoded in a JWT; used by client apps to access the 2bttns API

  const authHeader = ctx.req?.headers?.authorization;
  const token = authHeader?.split(" ")[1];
  if (token) {
    const decoded = jwt.decode(token);
    if (!decoded) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid token",
      });
    }

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
      return tokenData;
    }
  }

  // Otherwise, check if the user has a current session

  // In the 2bttns admin panel, "user" refers to the admin user, not the end user
  //  (end users don't log in to the admin panel; when they play a game they are referred to as "players")
  const isAdmin = ctx.session && ctx.session.user;
  if (isAdmin) {
    return { type: "admin_session" };
  }

  // Otherwise, they are not authorized
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "You are not authorized to access this resource",
  });
}

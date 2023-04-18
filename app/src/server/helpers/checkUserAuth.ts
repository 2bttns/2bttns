import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { CreateContextOptions } from "../api/trpc";

const jwtBaseSchema = z.object({
  sub: z.string().optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

const playerTokenSchema = z
  .object({
    type: z.literal("player_token"),
    userId: z.string(),
  })
  .merge(jwtBaseSchema);

const apiKeyTokenSchema = z
  .object({
    type: z.literal("api_key_token"),
    secretId: z.string(),
    secretValue: z.string(),
  })
  .merge(jwtBaseSchema);

const tokenSchema = z.union([playerTokenSchema, apiKeyTokenSchema]);

export function checkUserAuth(ctx: CreateContextOptions) {
  // Allow the user access if they have a valid Authorization header
  // The Authorization token can represent one of the following:
  //  1. player_token - Player ID encoded in a JWT; used when a player is bounced from to a 2bttns game
  //  2. api_key_token - API Key encoded in a JWT; used by client apps to access the 2bttns API

  const authHeader = ctx.req?.headers?.authorization;
  const token = authHeader?.split(" ")[1];
  if (token) {
    // TODO: Decode JWT and check if valid
    const decoded = jwt.decode(token);
    if (!decoded) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid token",
      });
    }

    const tokenData = tokenSchema.parse(decoded);
    switch (tokenData.type) {
      case "player_token":
        break;
      case "api_key_token":
        break;
    }

    if (tokenData.type) {
      return tokenData.type;
    }
  }

  // Otherwise, check if the user has a current session

  // In the 2bttns admin panel, "user" refers to the admin user, not the end user
  //  (end users don't log in to the admin panel; when they play a game they are referred to as "players")
  const isAdmin = ctx.session && ctx.session.user;
  if (isAdmin) {
    return "admin_session";
  }

  // Otherwise, they are not authorized
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "You are not authorized to access this resource",
  });
}

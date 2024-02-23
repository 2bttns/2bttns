import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { publicProcedure } from "../../trpc";

const input = z.object({
  app_id: z.string(),
  secret: z.string(),
  expires_in: z.string().optional(),
});

export const getJWT = publicProcedure
  .meta({
    openapi: {
      summary: "Generate JWT",
      description: `Returns a JSON Web Token (JWT) you can use to authenticate API calls to 2bttns.
      
You can get the \`app_id\` and \`secret\` from your 2bttns admin console, under Settings/Apps.
      `,
      tags: [OPENAPI_TAGS.AUTHENTICATION],
      method: "GET",
      path: "/authentication/token",
      protect: true,
    },
  })
  .input(input)
  .output(z.string())
  .query(async ({ ctx, input }) => {
    const { app_id: appId, secret, expires_in: expiresIn } = input;

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

    try {
      const token = jwt.sign({ type: "api_key_token", appId }, secret, {
        expiresIn: expiresIn ?? "24h",
      });
      return token;
    } catch (e) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Error generating JWT: ${(e as Error).message}`,
      });
    }
  });

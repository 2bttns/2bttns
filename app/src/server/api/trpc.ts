/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 *
 * These allow you to access things like the database, the session, etc, when
 * processing a request
 *
 */
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";

import { getServerAuthSession } from "../auth";
import { prisma } from "../db";

export type CreateContextOptions = {
  session: Session | null;
  prisma?: PrismaClient;
  headers?: NextApiRequest["headers"];
  authData?: CheckUserAuthData;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma: opts.prisma || prisma,
    headers: opts.headers,
    authData: opts.authData,
  };
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the unstable_getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return await createInnerTRPCContext({
    session,
    headers: req.headers,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
import { PrismaClient } from "@prisma/client";
import { TRPCError, initTRPC } from "@trpc/server";
import { NextApiRequest } from "next";
import superjson from "superjson";
import { OpenApiMeta } from "trpc-openapi";
import { CheckUserAuthData, checkUserAuth } from "../helpers/checkUserAuth";

export const t = initTRPC
  .context<typeof createTRPCContext>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape }) {
      return shape;
    },
  });

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authed) procedure for any of the following:
 * 1. Logged in admin -- when an admin is logged in (has an active session) with the 2bttns admin panel
 * 2. Authentication header with valid player_token -- particularly from users granted a play URL by an app integration
 * 3. Authentication header with valid api_key_token -- particularly from 2bttns SDK API calls
 */
export const anyAuthProtectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    let authData: CheckUserAuthData | undefined;
    try {
      authData = await checkUserAuth(ctx);
    } catch (error) {
      throw error;
    }
    return next({ ctx: { ...ctx, authData } });
  })
);

/**
 * Protected (authed) procedure for either of the following:
 * 1. Logged in admin -- when an admin is logged in (has an active session) with the 2bttns admin panel
 * 2. Authentication header with valid api_key_token -- particularly from 2bttns SDK API calls
 *
 * Does not allow player_token authentication -- use this for routes that should not be accessible to players
 */
export const adminOrApiKeyProtectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    let authData: CheckUserAuthData | undefined;
    try {
      authData = await checkUserAuth(ctx);

      if (authData.type === "player_token") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to access this resource",
        });
      }
    } catch (error) {
      throw error;
    }
    return next({ ctx: { ...ctx, authData } });
  })
);

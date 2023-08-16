import type { GetServerSidePropsContext } from "next";
import {
  DefaultUser,
  getServerSession,
  Session,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { env } from "../env.mjs";
import hashPassword from "../utils/hashPassword";
import { logger } from "../utils/logger";
import { prisma } from "./db";
import isAdmin from "./shared/isAdmin";

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      displayName?: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure
 * adapters, providers, callbacks, etc.
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      const sessionUser = user as Session["user"];
      try {
        if (!sessionUser) throw new Error("User session is undefined");

        const canSignIn = await isAdmin({
          userId: sessionUser.id,
          email: sessionUser.email ?? undefined,
        });

        if (canSignIn) {
          if (sessionUser.email)
            logger.info(
              `[signIn] User with email: ${sessionUser.email} signed in successfully.`
            );
          else
            logger.info(
              `[signIn] User with id: ${sessionUser.id} signed in successfully.`
            );
        }
        return canSignIn;
      } catch (error) {
        if (error instanceof Error) logger.error(error.message);
        else logger.error(error);
        return false;
      }
    },
    async session({ session }) {
      const { id, email, name } = session.user;

      // Can add custom properties to the session object here
      if (!id) {
        const adminId = await findAdminId(email, name);
        session.user.id = adminId;

        session.user.displayName =
          (
            await prisma.adminUser.findFirst({
              where: { id: adminId },
            })
          )?.displayName ?? undefined;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        try {
          if (!env.NEXTAUTH_SECRET)
            throw new Error("No NEXTAUTH_SECRET provided");
          if (!credentials?.username) throw new Error("No username provided");
          if (!credentials?.password) throw new Error("No password provided");

          const hashedPassword = hashPassword(
            credentials.password,
            env.NEXTAUTH_SECRET
          );

          // Find the admin credentials entry based on the username and hashed password
          // You can create new credentials via the `npm run create-admin-with-credentials:dev` script
          const adminCredentials = await prisma.adminCredential.findFirst({
            where: { username: credentials.username, hashedPassword },
          });
          if (!adminCredentials) {
            throw new Error(
              `No AdminCredential entry found for username=${credentials.username}. Username and/or password is incorrect. Rejecting login.`
            );
          }

          // Any object returned will be saved in `user` property of the JWT
          const user: DefaultUser = {
            id: adminCredentials.username,
            name: adminCredentials.username,
          };

          return user;
        } catch (e) {
          // If you return null then an error will be displayed advising the user to check their details.
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
          if (e instanceof Error) logger.error(e.message);
          else logger.error(e);
          return null;
        }
      },
    }),
    ...(env.GITHUB_ID && env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: env.GITHUB_ID,
            clientSecret: env.GITHUB_SECRET,
          }),
        ]
      : []),
    /**
     * ...add more providers here
     **/
  ],
  pages: {
    signIn: "/auth/signIn",
  },
};

/**
 * Wrapper for getServerSession so that you don't need
 * to import the authOptions in every file.
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

/**
 * Find the admin ID based on whether the admin signed in via OAuth or credentials
 */
async function findAdminId(
  email: string | null | undefined,
  name: string | null | undefined
) {
  let adminId: string | null = null;
  if (email) {
    const oauthAdmin = await prisma.adminUser.findFirst({
      where: { id: email },
    });
    adminId = oauthAdmin?.id ?? null;
  } else if (name) {
    const credentialsAdmin = await prisma.adminCredential.findFirst({
      where: { username: name },
    });
    const credentialsAdminUser = await prisma.adminUser.findFirst({
      where: { id: credentialsAdmin?.username },
    });
    adminId = credentialsAdminUser?.id ?? null;
  }
  if (!adminId) {
    throw new Error("Admin id is undefined. Cannot create session.");
  }
  return adminId;
}

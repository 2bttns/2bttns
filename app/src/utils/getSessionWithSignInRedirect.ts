import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import isAdmin from "../server/shared/isAdmin";
import { logger } from "./logger";
import wait from "./wait";

export default async function getSessionWithSignInRedirect(
  context: GetServerSidePropsContext,
  customCallbackUrl?: string
) {
  const callbackUrl = customCallbackUrl
    ? customCallbackUrl
    : `${context.resolvedUrl}`;
  const session = await getSession(context);

  // Check if the user is still an admin -- in case they were removed from the admin list while having an active session
  const isStillAdmin = session
    ? await isAdmin({
        email: session.user.email ?? undefined,
        userId: session.user.id,
      })
    : false;

  // Clear the session if the user is no longer an admin -- this means they were removed from the admin list while having an active session
  if (!isStillAdmin) {
    // TODO: Fix inifinite redirect loop when remove the admin user from the db while they have an active session & click on a link that requires admin access
    context.res.setHeader("Set-Cookie", [
      `next-auth.session-token=deleted; Max-Age=0`,
    ]);

    logger.info(`Clearing session for user with id: ${session?.user.id}`);
    return {
      session: null,
      redirect: {
        destination: `/auth/signIn?callbackUrl=${callbackUrl}`,
        permanent: false,
      },
    };
  }

  const shouldRedirectToSignIn = !session || !isStillAdmin;

  return {
    session: shouldRedirectToSignIn ? null : session,
    redirect: shouldRedirectToSignIn
      ? {
          destination: `/auth/signIn?callbackUrl=${callbackUrl}`,
          permanent: false,
        }
      : null,
  };
}

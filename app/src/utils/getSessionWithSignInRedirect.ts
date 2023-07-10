import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import isAdmin from "../server/shared/isAdmin";
import { logger } from "./logger";

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
    context.res.setHeader(
      "Set-Cookie",
      "next-auth.session-token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );

    logger.info(
      `Clearing session for user with id: ${session?.user.id ?? "<unknown_id>"}`
    );
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

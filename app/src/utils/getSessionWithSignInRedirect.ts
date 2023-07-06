import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import isAdmin from "../server/shared/isAdmin";

export default async function getSessionWithSignInRedirect(
  context: GetServerSidePropsContext,
  customCallbackUrl?: string
) {
  const callbackUrl = customCallbackUrl
    ? customCallbackUrl
    : `${context.resolvedUrl}`;
  const session = await getSession(context);

  // Check if the user is still an admin -- in case they were removed from the admin list while having an active session
  const isStillAdmin =
    session?.user.email &&
    (await isAdmin({
      email: session.user.email,
      userId: session.user.id,
      clearSessionsIfNotFound: true,
    }));

  const shouldRedirectToSignIn = !session || !isStillAdmin;

  return {
    session: shouldRedirectToSignIn ? null : session,
    redirect: shouldRedirectToSignIn
      ? {
          destination: `/api/auth/signin?callbackUrl=${callbackUrl}`,
          permanent: false,
        }
      : null,
  };
}
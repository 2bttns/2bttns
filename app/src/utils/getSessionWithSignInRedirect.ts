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
  if (!session) {
    // @TODO: Get sessions working manually for credentials provider; Credentials doesn't seem to be supported with adapters
    // @TODO: Find a way to get the AdminCredentials session
    // const credentialsSession = await prisma.session.findFirst({where: {userId: context.}})
  }

  // Check if the user is still an admin -- in case they were removed from the admin list while having an active session
  const isStillAdmin = session
    ? await isAdmin({
        email: session.user.email ?? undefined,
        userId: session.user.id,
        clearSessionsIfNotFound: true,
      })
    : false;

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

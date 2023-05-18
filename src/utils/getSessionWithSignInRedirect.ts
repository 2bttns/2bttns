import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

export default async function getSessionWithSignInRedirect(
  context: GetServerSidePropsContext,
  customCallbackUrl?: string
) {
  const callbackUrl = customCallbackUrl
    ? customCallbackUrl
    : `${context.resolvedUrl}`;
  const session = await getSession(context);

  return {
    session,
    redirect: !session
      ? {
          destination: `/api/auth/signin?callbackUrl=${callbackUrl}`,
          permanent: false,
        }
      : null,
  };
}

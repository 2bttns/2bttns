import jwt from "jsonwebtoken";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { z } from "zod";
import PlayContainer from "../features/play/containers/PlayContainer";
import { prisma } from "../server/db";

const jwtSchema = z.object({
  userId: z.string(),
  iat: z.preprocess((value) => new Date((value as number) * 1000), z.date()),
  exp: z.preprocess((value) => new Date((value as number) * 1000), z.date()),
});

type ReturnType = {
  gameId: string;
  userId: string;
  isAdmin: boolean;
};

export const getServerSideProps: GetServerSideProps<ReturnType> = async (
  context
) => {
  const url = `${context.req.headers.host}${context.req.url}`;
  const urlObj = new URL(url);
  const gameId = urlObj.searchParams.get("game_id");
  const appId = urlObj.searchParams.get("app_id");
  const incomingJwt = urlObj.searchParams.get("jwt");

  try {
    if (!gameId) {
      throw new Error("No game id provided");
    }

    const session = await getSession(context);

    let userId: string;
    if (session) {
      // The user is an admin signed into this 2bttns admin app
      // Note that users playing the game would never be signed into the admin app
      userId = session.user.id;
    } else {
      // The user was redirected here from an external app via JWT
      // Get the userId from that JWT
      if (!incomingJwt) {
        throw new Error("No jwt provided");
      }

      // Ensure the app id was provided, so it can be used to get verify the JWT against the corresponding secret
      if (!appId) {
        throw new Error("No app id provided");
      }

      // Ensure the incoming JWT is valid
      const appSecret = await prisma.secret.findFirst({
        where: { id: appId },
      });

      if (!appSecret) {
        throw new Error("Invalid app id");
      }

      jwt.verify(incomingJwt, appSecret.secret, {});
      const decodedJwtRaw = jwt.decode(incomingJwt, {});
      const decoded = jwtSchema.parse(decodedJwtRaw);
      userId = decoded.userId;
    }

    // Ensure the game exists
    await prisma.game.findFirstOrThrow({ where: { id: gameId } });

    return {
      props: {
        gameId: gameId ?? "",
        userId,
        isAdmin: !!session?.user,
      },
    };
  } catch (error) {
    console.error(error);

    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }
};

const Play: NextPage<ReturnType> = (props) => {
  const { gameId, userId, isAdmin } = props;

  return (
    <>
      <Head>
        <title>Play 2bttns</title>
        <meta
          name="description"
          content="You are now playing the 2bttns game."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>
        userId: {userId}
        {isAdmin ? " (Admin)" : null}
      </h1>
      <PlayContainer gameId={gameId} />
    </>
  );
};

export default Play;

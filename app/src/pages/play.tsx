import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import PlayContainer from "../features/play/containers/PlayContainer";
import { prisma } from "../server/db";

type ReturnType = {
  gameId: string;
};

export const getServerSideProps: GetServerSideProps<ReturnType> = async (
  context
) => {
  const url = `${context.req.headers.host}${context.req.url}`;
  const urlObj = new URL(url);
  const gameId = urlObj.searchParams.get("game_id");

  try {
    await prisma.game.findFirstOrThrow({ where: { id: gameId ?? undefined } });
  } catch (error) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  return {
    props: {
      gameId: gameId ?? "",
    },
  };
};

const Play: NextPage<ReturnType> = (props) => {
  const { gameId } = props;

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
      <PlayContainer gameId={gameId} />
    </>
  );
};

export default Play;

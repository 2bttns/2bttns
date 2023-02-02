import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import PlayContainer, {
  PlayContainerProps,
} from "../features/play/containers/PlayContainer";

const Play: NextPage = () => {
  const router = useRouter();
  const gameId = router.query.game_id as string | undefined;

  const handleInvalidGame: PlayContainerProps["handleInvalidGame"] = (
    error
  ) => {
    console.error(error);
    router.push("/404");
  };

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
      <PlayContainer gameId={gameId} handleInvalidGame={handleInvalidGame} />
    </>
  );
};

export default Play;

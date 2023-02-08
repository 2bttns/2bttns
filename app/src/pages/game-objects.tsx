import type { NextPage } from "next";
import Head from "next/head";
import GameObjectsContainer from "../features/gameobjects/containers/GameObjectsContainer";

const Lists: NextPage = () => {
  return (
    <>
      <Head>
        <title>My Game Objects | 2bttns</title>
        <meta name="description" content="Lists" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GameObjectsContainer />
    </>
  );
};

export default Lists;

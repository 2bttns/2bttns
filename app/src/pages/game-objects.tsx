import type { NextPage } from "next";
import Head from "next/head";
import GameObjectsTableContainer from "../features/gameobjects/containers/GameObjectsTableContainer";

const Lists: NextPage = () => {
  return (
    <>
      <Head>
        <title>My Game Objects | 2bttns</title>
        <meta name="description" content="Lists" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GameObjectsTableContainer />
    </>
  );
};

export default Lists;

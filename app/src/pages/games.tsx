import { NextPage } from "next";
import Head from "next/head";
import GamesContainer from "../features/games/containers/GamesContainer";

const GamesPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>My Games | 2bttns</title>
        <meta name="description" content="My 2bttns Games" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GamesContainer />
    </>
  );
};

export default GamesPage;

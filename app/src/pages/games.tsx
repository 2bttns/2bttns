import { NextPage } from "next";
import Head from "next/head";
import GamesTable from "../features/games/components/GamesTable";

const GamesPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Games | 2bttns</title>
        <meta name="description" content="Game management panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GamesTable />
    </>
  );
};

export default GamesPage;

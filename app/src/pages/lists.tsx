import type { NextPage } from "next";
import Head from "next/head";
import ListsContainer from "../features/lists/containers/ListsContainer";

const Lists: NextPage = () => {
  return (
    <>
      <Head>
        <title>My Lists | 2bttns</title>
        <meta name="description" content="Lists" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ListsContainer />
    </>
  );
};

export default Lists;

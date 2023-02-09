import { NextPage } from "next";
import Head from "next/head";
import TagsContainer from "../features/tags/containers/TagsContainer";

const TagsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Tags | 2bttns</title>
        <meta name="description" content="My 2bttns Games" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TagsContainer />
    </>
  );
};

export default TagsPage;

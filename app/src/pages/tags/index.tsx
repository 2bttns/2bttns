import { NextPage } from "next";
import Head from "next/head";
import TagsLayoutContainer from "../../features/tags/containers/TagsLayoutContainer";

const TagsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Tags | 2bttns</title>
        <meta name="description" content="My 2bttns Games" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TagsLayoutContainer>
        <h1>No tag selected</h1>
      </TagsLayoutContainer>
    </>
  );
};

export default TagsPage;

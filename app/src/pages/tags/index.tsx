import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import TagsLayoutContainer from "../../features/tags/containers/TagsLayoutContainer";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";

export type TagsPageProps = {
  session: Session;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, redirect } = await getSessionWithSignInRedirect(context);

  if (!session && redirect) {
    return {
      redirect,
    };
  }

  return {
    props: {
      session,
    },
  };
};

const TagsPage: NextPage<TagsPageProps> = (props) => {
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

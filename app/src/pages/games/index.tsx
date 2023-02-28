import { SettingsIcon } from "@chakra-ui/icons";
import { Heading, IconButton, Tooltip } from "@chakra-ui/react";
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import DeleteGameButton from "../../features/games/containers/DeleteGameButton";
import GamesTable from "../../features/games/containers/GamesTable";
import ManageGameButton from "../../features/games/containers/ManageGameButton";
import PlayGameButton from "../../features/games/containers/PlayGameButton";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";

export type GamesPageProps = {
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

const GamesPage: NextPage<GamesPageProps> = (props) => {
  return (
    <>
      <Head>
        <title>Games | 2bttns</title>
        <meta name="description" content="Game management panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Heading as="h1" size="2xl">
        Manage Games
      </Heading>

      <GamesTable
        additionalActions={(gameData) => {
          const { id } = gameData;
          return (
            <>
              <PlayGameButton gameId={id} />
              <ManageGameButton gameId={id} />
              <DeleteGameButton gameId={id} />
            </>
          );
        }}
      />
    </>
  );
};

export default GamesPage;

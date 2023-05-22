import { ButtonGroup, Heading } from "@chakra-ui/react";
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import DeleteGameButton from "../../features/games/containers/DeleteGameButton";
import GamesTable, {
  GameData,
} from "../../features/games/containers/GamesTable";
import ManageGameButton from "../../features/games/containers/ManageGameButton";
import PlayGameButton from "../../features/games/containers/PlayGameButton";
import { AdditionalColumns } from "../../features/shared/components/Table/containers/PaginatedTable";
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

      <GamesTable additionalColumns={getAdditionalColumns()} />
    </>
  );
};

function getAdditionalColumns(): AdditionalColumns<GameData> {
  return {
    columns: [
      {
        id: "actions",
        cell: (row) => {
          const { id } = row;
          return (
            <ButtonGroup width="100%" justifyContent="end">
              <PlayGameButton gameId={id} />
              <ManageGameButton gameId={id} />
              <DeleteGameButton gameId={id} />
            </ButtonGroup>
          );
        },
      },
    ],

    // Re-render the table the game objects table when these change
    // Without this, relationship weights might not update correctly when navigating to another game object's page
    dependencies: [],
  };
}

export default GamesPage;
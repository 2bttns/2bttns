import { Box } from "@chakra-ui/react";
import type { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import CsvImport from "../../features/csv-import/CsvImport";
import DeleteGameObjectButton from "../../features/gameobjects/containers/DeleteGameObjectButton";
import GameObjectsTable from "../../features/gameobjects/containers/GameObjectsTable";
import ManageGameObjectButton from "../../features/gameobjects/containers/ManageGameObjectButton";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";

export type GameObjectsPageProps = {
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

const GameObjects: NextPage<GameObjectsPageProps> = (props) => {
  return (
    <>
      <Head>
        <title>Game Objects | 2bttns</title>
        <meta name="description" content="Game object management panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box width="100%" height="100%" overflow="scroll">
        <GameObjectsTable
          additionalTopBarContent={<CsvImport />}
          additionalActions={({ id, name }) => (
            <>
              <ManageGameObjectButton gameObjectId={id} gameObjectName={name} />
              <DeleteGameObjectButton gameObjectId={id} />
            </>
          )}
        />
      </Box>
    </>
  );
};

export default GameObjects;

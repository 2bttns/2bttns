import { Box } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import DeleteGameObjectButton from "../features/gameobjects/containers/DeleteGameObjectButton";
import GameObjectsTable from "../features/gameobjects/containers/GameObjectsTable";

const Lists: NextPage = () => {
  return (
    <>
      <Head>
        <title>Game Objects | 2bttns</title>
        <meta name="description" content="Game object management panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        width="100vw"
        height="100vh"
        backgroundColor="white"
        overflow="hidden"
      >
        <GameObjectsTable
          additionalActions={(gameObjectData) => (
            <>
              <DeleteGameObjectButton gameObjectId={gameObjectData.id} />
            </>
          )}
        />
      </Box>
    </>
  );
};

export default Lists;

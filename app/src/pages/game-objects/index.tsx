import { Box } from "@chakra-ui/react";
import type { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import CsvImport from "../../features/csv-import/CsvImport";
import DeleteGameObjectButton from "../../features/gameobjects/containers/DeleteGameObjectButton";
import GameObjectsTable from "../../features/gameobjects/containers/GameObjectsTable";
import ManageGameObjectButton from "../../features/gameobjects/containers/ManageGameObjectButton";
import TagFilterToggles from "../../features/tags/containers/TagFilterToggles";
import useAllTagFilters from "../../features/tags/hooks/useAllTagFilters";
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
  const tagFilter = useAllTagFilters();

  return (
    <>
      <Head>
        <title>Game Objects | 2bttns</title>
        <meta name="description" content="Game object management panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box marginY="1rem">
        <TagFilterToggles
          filter={tagFilter.state.tagFilter}
          setFilter={tagFilter.state.setTagFilter}
          allowMultiple
          allAndNoneToggles
        />
      </Box>
      <Box width="100%" height="100%" overflow="scroll">
        <GameObjectsTable
          tag={{
            include: tagFilter.results.includeTags,
            exclude: tagFilter.results.excludeTags,
            includeUntagged: tagFilter.results.includeUntagged,
          }}
          additionalTopBarContent={<CsvImport />}
          additionalActions={({ id, name }) => (
            <>
              <ManageGameObjectButton gameObjectId={id} />
              <DeleteGameObjectButton gameObjectId={id} />
            </>
          )}
        />
      </Box>
    </>
  );
};

export default GameObjects;

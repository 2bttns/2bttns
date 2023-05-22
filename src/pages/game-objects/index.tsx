import { Box, ButtonGroup } from "@chakra-ui/react";
import type { GetServerSideProps } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import CsvImport from "../../features/csv/CsvImport";
import DeleteGameObjectButton from "../../features/gameobjects/containers/DeleteGameObjectButton";
import GameObjectsTable, {
  GameObjectData,
} from "../../features/gameobjects/containers/GameObjectsTable";
import ManageGameObjectButton from "../../features/gameobjects/containers/ManageGameObjectButton";
import { AdditionalColumns } from "../../features/shared/components/Table/containers/PaginatedTable";
import TagFilterToggles from "../../features/tags/containers/TagFilterToggles";
import useAllTagFilters from "../../features/tags/hooks/useAllTagFilters";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";
import { NextPageWithLayout } from "../_app";

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

const GameObjects: NextPageWithLayout<GameObjectsPageProps> = (props) => {
  const tagFilter = useAllTagFilters();

  return (
    <>
      <Head>
        <title>Game Objects | 2bttns</title>
        <meta name="description" content="Game object management panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box overflow="hidden">
        <Box marginY="1rem">
          <TagFilterToggles
            filter={tagFilter.state.tagFilter}
            setFilter={tagFilter.state.setTagFilter}
            allowMultiple
            allAndNoneToggles
          />
        </Box>
        <GameObjectsTable
          tag={{
            include: tagFilter.results.includeTags,
            exclude: tagFilter.results.excludeTags,
            includeUntagged: tagFilter.results.includeUntagged,
          }}
          additionalTopBarContent={<CsvImport />}
          additionalColumns={getAdditionalColumns()}
        />
      </Box>
    </>
  );
};

function getAdditionalColumns(): AdditionalColumns<GameObjectData> {
  return {
    columns: [
      {
        id: "actions",
        cell: (row) => {
          return (
            <ButtonGroup width="100%" justifyContent="end">
              <ManageGameObjectButton gameObjectId={row.id} />
              <DeleteGameObjectButton gameObjectId={row.id} />
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

export default GameObjects;

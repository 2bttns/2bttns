import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  ButtonGroup,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import type { GetServerSideProps } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import DeleteGameObjectButton from "../../features/gameobjects/containers/DeleteGameObjectButton";
import GameObjectsTable, {
  GameObjectData,
} from "../../features/gameobjects/containers/GameObjectsTable";
import ManageGameObjectButton from "../../features/gameobjects/containers/ManageGameObjectButton";
import { AdditionalColumns } from "../../features/shared/components/Table/containers/PaginatedTable";
import { EditTagsForGameObjectsButtonDrawer } from "../../features/tags/containers/EditTagsForGameObjectsButtonDrawer";
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
      <Box overflow="hidden" padding="1rem">
        <Box marginY="4px">
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
          additionalTopBarContent={(selectedRows) => (
            <AdditionalTopBarContent selectedRows={selectedRows} />
          )}
          additionalColumns={getAdditionalColumns()}
        />
      </Box>
    </>
  );
};

type AdditionalTopBarContentProps = {
  selectedRows: GameObjectData[];
};

function AdditionalTopBarContent(props: AdditionalTopBarContentProps) {
  const { selectedRows } = props;

  return (
    <>
      <ButtonGroup>
        {/* <CsvImport />- @TODO: Move to Menu */}
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            Actions
          </MenuButton>
          <MenuList zIndex={99}>
            <MenuItem
              onClick={() => {
                window.alert(`Delete ${selectedRows.length} selected items?`);
              }}
            >
              Delete
            </MenuItem>
            <MenuItem>Tag</MenuItem>
            <MenuItem>Export CSV</MenuItem>
            {/* Update CsvImport function & export selected items */}
            <MenuItem>Import CSV</MenuItem>
          </MenuList>
        </Menu>
      </ButtonGroup>
    </>
  );
}

function getAdditionalColumns(): AdditionalColumns<GameObjectData> {
  return {
    columns: [
      {
        id: "actions",
        cell: (row) => {
          return <Actions gameObjectId={row.id} gameObjectName={row.name} />;
        },
      },
    ],
    dependencies: [],
  };
}

type ActionsProps = {
  gameObjectId: GameObjectData["id"];
  gameObjectName: GameObjectData["name"];
};
function Actions(props: ActionsProps) {
  const { gameObjectId, gameObjectName } = props;

  return (
    <>
      <ButtonGroup width="100%" justifyContent="center">
        <EditTagsForGameObjectsButtonDrawer
          gameObjectId={gameObjectId}
          gameObjectName={gameObjectName}
        />
        <ManageGameObjectButton gameObjectId={gameObjectId} />
        <DeleteGameObjectButton gameObjectId={gameObjectId} />
      </ButtonGroup>
    </>
  );
}

export default GameObjects;

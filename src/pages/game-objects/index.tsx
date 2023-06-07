import { Box, ButtonGroup, Divider } from "@chakra-ui/react";
import type { GetServerSideProps } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import DeleteGameObjectButton from "../../features/gameobjects/containers/DeleteGameObjectButton";
import GameObjectsTable, {
  GameObjectData,
} from "../../features/gameobjects/containers/GameObjectsTable";
import ManageGameObjectButton from "../../features/gameobjects/containers/ManageGameObjectButton";
import DeleteSelectedGameObjects from "../../features/gameobjects/containers/TableActionsMenu/DeleteSelectedGameObjects";
import ExportAllGameObjectsJSON from "../../features/gameobjects/containers/TableActionsMenu/ExportAllGameObjectsJSON";
import ExportSelectedGameObjectsJSON from "../../features/gameobjects/containers/TableActionsMenu/ExportSelectedGameObjectsJSON";
import { AdditionalColumns } from "../../features/shared/components/Table/containers/PaginatedTable";
import TableActionsMenu from "../../features/shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemBulkTag from "../../features/shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemBulkTag";
import { EditTagsForGameObjectsButtonDrawer } from "../../features/tags/containers/EditTagsForGameObjectsButtonDrawer";
import { SelectTagFiltersDrawerButton } from "../../features/tags/containers/SelectTagFiltersDrawerButton";
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
        <GameObjectsTable
          tag={{
            include: tagFilter.results.includeTags,
            exclude: tagFilter.results.excludeTags,
            untaggedFilter: tagFilter.results.untaggedFilter,
          }}
          additionalTopBarContent={(selectedRows) => (
            <AdditionalTopBarContent
              selectedRows={selectedRows}
              tagFilter={tagFilter}
            />
          )}
          additionalColumns={getAdditionalColumns()}
        />
      </Box>
    </>
  );
};

type AdditionalTopBarContentProps = {
  selectedRows: GameObjectData[];
  tagFilter: ReturnType<typeof useAllTagFilters>;
};

function AdditionalTopBarContent(props: AdditionalTopBarContentProps) {
  const { selectedRows, tagFilter } = props;

  return (
    <>
      <ButtonGroup>
        <TableActionsMenu
          selectedRows={selectedRows}
          actionItems={(context) => (
            <>
              <TableActionsMenuItemBulkTag context={context} />
              <Divider />
              {/* MAJOR TODO: determine import/export format for all 2bttns data structures
                e.g. Export tags; but with a unified format so tags aren't duplicated for each exported item
                e.g. {gameobjects: [...], tags:[...]}

                Consider import order too. e.g. import tags first, then gameobjects, then relationships
              */}
              <ExportSelectedGameObjectsJSON context={context} />
              <ExportAllGameObjectsJSON
                context={context}
                filteredTags={tagFilter.results.includeTags}
              />
              <Divider />
              <DeleteSelectedGameObjects context={context} />
            </>
          )}
        />
        <SelectTagFiltersDrawerButton
          tagFilter={tagFilter.state.tagFilter}
          setTagFilter={tagFilter.state.setTagFilter}
          tagFilterLoading={tagFilter.tagsQuery.isLoading}
        />
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
          return <Actions gameObjectId={row.id} />;
        },
      },
    ],
    dependencies: [],
  };
}

type ActionsProps = {
  gameObjectId: GameObjectData["id"];
};
function Actions(props: ActionsProps) {
  const { gameObjectId } = props;

  return (
    <>
      <ButtonGroup width="100%" justifyContent="center">
        <EditTagsForGameObjectsButtonDrawer gameObjectIds={[gameObjectId]} />
        <ManageGameObjectButton gameObjectId={gameObjectId} />
        <DeleteGameObjectButton gameObjectId={gameObjectId} />
      </ButtonGroup>
    </>
  );
}

export default GameObjects;

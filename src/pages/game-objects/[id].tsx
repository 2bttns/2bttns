import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  ButtonGroup,
  Divider,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { GameObject, Tag } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import DeleteGameObjectButton from "../../features/gameobjects/containers/DeleteGameObjectButton";
import GameObjectsTable, {
  GameObjectData,
} from "../../features/gameobjects/containers/GameObjectsTable";
import ManageGameObjectButton from "../../features/gameobjects/containers/ManageGameObjectButton";
import RelateGameObjects from "../../features/gameobjects/containers/RelateGameObjects";
import TagMultiSelect, {
  TagOption,
} from "../../features/gameobjects/containers/TagMultiSelect";
import CustomEditable from "../../features/shared/components/CustomEditable";
import { AdditionalColumns } from "../../features/shared/components/Table/containers/PaginatedTable";
import TagFilterToggles from "../../features/tags/containers/TagFilterToggles";
import useAllTagFilters from "../../features/tags/hooks/useAllTagFilters";
import { prisma } from "../../server/db";
import { api, RouterInputs } from "../../utils/api";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";

export type GameObjectByIdPageProps = {
  gameObjectId: GameObject["id"];
  session: Session;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, redirect } = await getSessionWithSignInRedirect(context);
  if (!session && redirect) {
    return {
      redirect,
    };
  }

  const gameObjectId = context.params?.id as string;
  try {
    await prisma.gameObject.findUniqueOrThrow({
      where: {
        id: gameObjectId,
      },
    });
  } catch (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      gameObjectId,
      session,
    },
  };
};

const GameObjectById: NextPage<GameObjectByIdPageProps> = (props) => {
  const { gameObjectId } = props;

  const tagFilter = useAllTagFilters();

  return (
    <>
      <Box width="100%">
        <Box>
          <GameObjectDetails gameObjectId={gameObjectId} />
          <Divider />
        </Box>

        <Box marginY="1rem">
          <TagFilterToggles
            filter={tagFilter.state.tagFilter}
            setFilter={tagFilter.state.setTagFilter}
            allowMultiple
            allAndNoneToggles
          />
        </Box>

        <GameObjectsTable
          gameObjectsToExclude={[gameObjectId]}
          tag={{
            include: tagFilter.results.includeTags,
            exclude: tagFilter.results.excludeTags,
            includeUntagged: tagFilter.results.includeUntagged,
          }}
          additionalColumns={getAdditionalColumns(gameObjectId)}
        />
      </Box>
    </>
  );
};

function getAdditionalColumns(
  gameObjectId: GameObject["id"]
): AdditionalColumns<GameObjectData> {
  return {
    columns: [
      {
        name: "Relationship Weight",
        cell: ({ id }) => {
          return (
            <RelateGameObjects
              gameObjectId1={gameObjectId}
              gameObjectId2={id}
            />
          );
        },
        minWidth: "500px",
      },
      {
        cell: ({ id }) => {
          return (
            <ButtonGroup width="100%" justifyContent="end">
              <ManageGameObjectButton gameObjectId={id} />
            </ButtonGroup>
          );
        },
      },
    ],

    // Re-render the table the game objects table when these change
    // Without this, relationship weights might not update correctly when navigating to another game object's page
    dependencies: [gameObjectId],
  };
}

type GameObjectDetailsProps = {
  gameObjectId: string;
};

function GameObjectDetails(props: GameObjectDetailsProps) {
  const { gameObjectId } = props;
  const gameObjectQuery = api.gameObjects.getById.useQuery({
    id: gameObjectId,
    includeTags: true,
  });
  const gameObject = gameObjectQuery.data?.gameObject;
  const name = gameObject?.name ?? "Untitled Game Object";

  const utils = api.useContext();
  const updateGameObjectMutation = api.gameObjects.updateById.useMutation();
  const handleUpdateGameObject = async (
    input: RouterInputs["gameObjects"]["updateById"]
  ) => {
    try {
      await updateGameObjectMutation.mutateAsync(input);
      await utils.gameObjects.invalidate();
    } catch (error) {
      console.error(error);
      window.alert("Error updating game object. See console for details.");
    }
  };

  const selected: TagOption[] =
    gameObject?.tags?.map((tag: Tag) => ({
      label: tag.name || "Untitled Tag",
      value: tag.id,
    })) || [];

  const router = useRouter();
  const onDeleted = () => {
    router.push("/game-objects");
  };

  if (!gameObject) return null;

  return (
    <Box>
      <Head>
        <title>{name} - GameObjects | 2bttns</title>
        <meta name="description" content="Manage Game Object" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HStack justifyContent="space-between">
        <Breadcrumb
          spacing="4px"
          separator={<ChevronRightIcon color="gray.500" />}
          marginBottom="1rem"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/game-objects">Game Objects</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href={`/game-objects/${gameObject.id}`}>
              {name || "Untitled Game Object"}
              <Text color="blue.500" display="inline">
                {" "}
                ({gameObject.id})
              </Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <DeleteGameObjectButton
          gameObjectId={gameObject.id}
          onDeleted={onDeleted}
        />
      </HStack>

      <Heading size="xl">
        <CustomEditable
          value={gameObject.name ?? ""}
          placeholder="Untitled Game Object"
          handleSave={async (value) => {
            handleUpdateGameObject({
              id: gameObject.id,
              data: { name: value },
            });
          }}
        />
      </Heading>
      <CustomEditable
        isTextarea
        value={gameObject.description ?? ""}
        placeholder="No description"
        handleSave={async (value) => {
          handleUpdateGameObject({
            id: gameObject.id,
            data: { description: value },
          });
        }}
      />
      <Box marginTop="1rem">
        <TagMultiSelect
          selected={selected}
          onChange={(nextTags) => {
            handleUpdateGameObject({
              id: gameObject.id,
              data: { tags: nextTags },
            });
          }}
          isEditable
        />
      </Box>
    </Box>
  );
}

export default GameObjectById;

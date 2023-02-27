import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
import GameObjectsTable from "../../features/gameobjects/containers/GameObjectsTable";
import ManageGameObjectButton from "../../features/gameobjects/containers/ManageGameObjectButton";
import RelateGameObjects from "../../features/gameobjects/containers/RelateGameObjects";
import TagMultiSelect, {
  TagOption,
} from "../../features/gameobjects/containers/TagMultiSelect";
import { NAVBAR_HEIGHT_PX } from "../../features/navbar/views/Navbar";
import CustomEditable from "../../features/shared/components/CustomEditable";
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

const GAME_OBJECT_DETAILS_HEIGHT_PX = "200px";

const GameObjectById: NextPage<GameObjectByIdPageProps> = (props) => {
  const { gameObjectId } = props;

  return (
    <>
      <Box
        width="100%"
        height={`calc(100vh - ${NAVBAR_HEIGHT_PX} - ${GAME_OBJECT_DETAILS_HEIGHT_PX})`}
      >
        <Box height={GAME_OBJECT_DETAILS_HEIGHT_PX}>
          <GameObjectDetails gameObjectId={gameObjectId} />
          <Divider />
        </Box>

        <GameObjectsTable
          gameObjectsToExclude={[gameObjectId]}
          additionalColumns={[
            {
              id: "Relationships",
              header: "Relationship Weight",
              cell: (info) => {
                return (
                  <RelateGameObjects
                    gameObjectId1={gameObjectId}
                    gameObjectId2={info.row.original.id}
                  />
                );
              },
            },
          ]}
          additionalActions={({ id, name }) => (
            <>
              <ManageGameObjectButton gameObjectId={id} />
            </>
          )}
        />
      </Box>
    </>
  );
};

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
    <Box marginY="1rem">
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

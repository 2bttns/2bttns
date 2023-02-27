import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  Text,
} from "@chakra-ui/react";
import { GameObject } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import { useEffect, useState } from "react";
import GameObjectsTable from "../../features/gameobjects/containers/GameObjectsTable";
import ManageGameObjectButton from "../../features/gameobjects/containers/ManageGameObjectButton";
import RelateGameObjects from "../../features/gameobjects/containers/RelateGameObjects";
import { prisma } from "../../server/db";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";

export type GameObjectByIdPageProps = {
  gameObject: GameObject;
  session: Session;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, redirect } = await getSessionWithSignInRedirect(context);
  if (!session && redirect) {
    return {
      redirect,
    };
  }

  try {
    const id = context.params?.id;
    const gameObject = await prisma.gameObject.findUnique({
      where: {
        id: id as string,
      },
    });
    if (!gameObject) {
      throw new Error(`Game object with id ${id} not found`);
    }
    return {
      props: {
        // Parse & stringify to serialize all Prisma fields properly (particularly dates)
        gameObject: JSON.parse(JSON.stringify(gameObject)),
        session,
      },
    };
  } catch (error) {
    console.error(error);
  }
  return {
    notFound: true,
  };
};

const GameObjectById: NextPage<GameObjectByIdPageProps> = (props) => {
  const [gameObject, setGameObject] = useState(props.gameObject);
  useEffect(() => {
    setGameObject(props.gameObject);
  }, [props]);

  const name = gameObject.name ?? "Untitled GameObject";

  return (
    <>
      <Head>
        <title>{name} - GameObjects | 2bttns</title>
        <meta name="description" content="Manage Game Object" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
            {name}
            <Text color="blue.500" display="inline">
              {" "}
              ({gameObject.id})
            </Text>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Box width="100%" height="100%" overflow="scroll">
        <GameObjectsTable
          gameObjectsToExclude={[gameObject.id]}
          additionalColumns={[
            {
              id: "Relationships",
              header: "Relationship Weight",
              cell: (info) => {
                return (
                  <RelateGameObjects
                    gameObjectId1={gameObject.id}
                    gameObjectId2={info.row.original.id}
                  />
                );
              },
            },
          ]}
          additionalActions={({ id }) => (
            <>
              <ManageGameObjectButton gameObjectId={id} />
            </>
          )}
        />
      </Box>
    </>
  );
};

export default GameObjectById;

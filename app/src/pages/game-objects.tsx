import { LinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Select,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { GameObject } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import React from "react";
import DeleteGameObjectButton from "../features/gameobjects/containers/DeleteGameObjectButton";
import GameObjectsTable from "../features/gameobjects/containers/GameObjectsTable";
import { api } from "../utils/api";
import getSessionWithSignInRedirect from "../utils/getSessionWithSignInRedirect";

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
          additionalActions={(gameObjectData) => (
            <>
              <EditRelationshipsDrawer gameObjectId={gameObjectData.id} />
              <DeleteGameObjectButton gameObjectId={gameObjectData.id} />
            </>
          )}
        />
      </Box>
    </>
  );
};

export default GameObjects;

export type EditRelationshipsDrawerProps = {
  gameObjectId: GameObject["id"];
};

function EditRelationshipsDrawer(props: EditRelationshipsDrawerProps) {
  const { gameObjectId } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef<HTMLButtonElement | null>(null);

  const gameObjectQuery = api.gameObjects.getById.useQuery(
    {
      id: gameObjectId,
    },
    {
      enabled: isOpen,
    }
  );

  const weightsQuery = api.weights.getAll.useQuery(null, { enabled: isOpen });

  const label = "Edit Relationships";
  const title = `${label} - ${gameObjectQuery.data?.gameObject?.id}`;

  if (gameObjectQuery.isFetching) {
    return null;
  }

  if (gameObjectQuery.isError) {
    return <div>Failed to load game object</div>;
  }

  if (weightsQuery.isFetching) {
    return null;
  }

  if (weightsQuery.isError) {
    return <div>Failed to load weights</div>;
  }

  const hasWeights =
    weightsQuery.data?.weights && weightsQuery.data?.weights.length > 0;

  return (
    <>
      <Tooltip label={label} placement="top">
        <IconButton
          ref={btnRef}
          colorScheme="teal"
          onClick={onOpen}
          aria-label={label}
          size="sm"
        >
          <LinkIcon />
        </IconButton>
      </Tooltip>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{title}</DrawerHeader>

          <DrawerBody>
            <Box width="100%" height="100%" overflow="none">
              <GameObjectsTable
                additionalActions={(gameObjectData) => (
                  <>
                    <Select
                      sx={{ width: "256px" }}
                      disabled={!hasWeights}
                      placeholder={hasWeights ? "Select Weight" : "No Weights"}
                    >
                      {weightsQuery.data?.weights.map((weight) => (
                        <option key={weight.id} value={weight.id}>
                          {weight.name ?? "Untitled Weight"}
                        </option>
                      ))}
                    </Select>
                  </>
                )}
              />
            </Box>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

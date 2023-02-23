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
  Input,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import type { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import React from "react";
import DeleteGameObjectButton from "../features/gameobjects/containers/DeleteGameObjectButton";
import GameObjectsTable from "../features/gameobjects/containers/GameObjectsTable";
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
              <EditRelationshipsDrawer />
              <DeleteGameObjectButton gameObjectId={gameObjectData.id} />
            </>
          )}
        />
      </Box>
    </>
  );
};

export default GameObjects;

function EditRelationshipsDrawer() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const title = "Edit Relationships";

  return (
    <>
      <Tooltip label={title} placement="top">
        <IconButton
          ref={btnRef}
          colorScheme="teal"
          onClick={onOpen}
          aria-label={title}
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
        size="xl"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{title}</DrawerHeader>

          <DrawerBody>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim minima
            cum sapiente maiores, libero inventore nam eum itaque ad beatae
            incidunt iste perspiciatis nesciunt cupiditate animi quia
            repellendus veniam cumque iusto! Animi doloremque reiciendis,
            repellat dolore tenetur voluptas natus quia porro recusandae iure
            esse ullam eaque assumenda enim rerum odio.
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

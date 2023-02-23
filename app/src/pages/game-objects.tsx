import { LinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  ButtonGroup,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
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
                    {/* <ButtonGroup size="sm" variant="ghost">
                      <Button>NONE</Button>
                      {weightsQuery.data?.weights.map((weight) => (
                        <Button key={weight.id}>
                          {weight.name ?? "Untitled Weight"}
                        </Button>
                      ))}
                    </ButtonGroup> */}

                    <RadioGroup
                      options={[
                        { id: "NONE", name: "NONE" },
                        ...(weightsQuery.data?.weights.map((weight) => ({
                          id: weight.id,
                          name: weight.name ?? "Untitled Weight",
                        })) ?? []),
                      ]}
                      selected="NONE"
                      onChange={(value) => {
                        console.log(value);
                      }}
                      // TODO: Default value based on existing relationships
                    />
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

// Step 2: Use the `useRadioGroup` hook to control a group of custom radios.
export type RadioGroupProps = {
  options: { id: string; name: string }[];
  selected: string;
  onChange: (id: string) => void;
};

function RadioGroup(props: RadioGroupProps) {
  const { options, selected, onChange } = props;

  return (
    <ButtonGroup size="sm">
      {options.map(({ id, name }) => {
        return (
          <Button
            key={id}
            variant={id === selected ? "solid" : "ghost"}
            onClick={() => {
              if (id === selected) return;
              onChange(id);
            }}
          >
            {name}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}

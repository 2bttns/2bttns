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
import { useMemo } from "react";
import { api } from "../../../utils/api";
import GameObjectsTable from "./GameObjectsTable";

export type EditRelationshipsProps = {
  gameObjectId: GameObject["id"];
};

export default function EditRelationships(props: EditRelationshipsProps) {
  const { gameObjectId } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const label = "Edit Relationships";

  return (
    <>
      <Tooltip label={label} placement="top">
        <IconButton
          colorScheme="teal"
          onClick={onOpen}
          aria-label={label}
          size="sm"
        >
          <LinkIcon />
        </IconButton>
      </Tooltip>
      <EditRelationshipsDrawer
        isOpen={isOpen}
        onClose={onClose}
        gameObjectId={gameObjectId}
      />
    </>
  );
}

export type EditRelationshipsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  gameObjectId: GameObject["id"];
};

function EditRelationshipsDrawer(props: EditRelationshipsDrawerProps) {
  const { isOpen, onClose, gameObjectId } = props;

  const gameObjectQuery = api.gameObjects.getById.useQuery(
    {
      id: gameObjectId,
    },
    {
      enabled: isOpen,
    }
  );

  const title = `Edit Relationships - ${gameObjectQuery.data?.gameObject?.name}`;

  if (gameObjectQuery.isFetching) {
    return null;
  }

  if (gameObjectQuery.isError) {
    return <div>Failed to load game object</div>;
  }

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{title}</DrawerHeader>

        <DrawerBody>
          <Box width="100%" height="100%" overflow="none">
            <GameObjectsTable
              additionalActions={(gameObjectData) => (
                <>
                  <RelateGameObjects
                    gameObjectId1={gameObjectId}
                    gameObjectId2={gameObjectData.id}
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
  );
}

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

export type RelateGameObjectsProps = {
  gameObjectId1: GameObject["id"];
  gameObjectId2: GameObject["id"];
};

function RelateGameObjects(props: RelateGameObjectsProps) {
  const { gameObjectId1, gameObjectId2 } = props;

  const utils = api.useContext();
  const relationshipsQuery = api.gameObjects.getRelationship.useQuery({
    fromGameObjectId: gameObjectId1,
    toGameObjectId: gameObjectId2,
  });
  const selected = useMemo(() => {
    return relationshipsQuery.data?.relationship?.weightId ?? "NONE";
  }, [relationshipsQuery.data]);

  const upsertRelationshipMutation =
    api.gameObjects.upsertRelationship.useMutation();

  const deleteRelationshipMutation =
    api.gameObjects.deleteRelationship.useMutation();

  const handleChange: RadioGroupProps["onChange"] = async (id) => {
    if (id === "NONE") {
      await deleteRelationshipMutation.mutateAsync({
        gameObjectId1,
        gameObjectId2,
      });

      await utils.gameObjects.getRelationship.invalidate({
        fromGameObjectId: gameObjectId1,
        toGameObjectId: gameObjectId2,
      });
      return;
    }

    try {
      await upsertRelationshipMutation.mutateAsync({
        gameObjectId1,
        gameObjectId2,
        weightId: id,
      });

      await utils.gameObjects.getRelationship.invalidate({
        fromGameObjectId: gameObjectId1,
        toGameObjectId: gameObjectId2,
      });
    } catch (error) {
      console.error(error);
      window.alert("Failed to relate game objects. See console for details.");
    }
  };

  const weightsQuery = api.weights.getAll.useQuery(null);
  if (weightsQuery.isFetching) {
    return null;
  }

  if (weightsQuery.isError) {
    return <div>Failed to load weights</div>;
  }

  const options: RadioGroupProps["options"] = [
    { id: "NONE", name: "NONE" },
    ...(weightsQuery.data?.weights.map((weight) => ({
      id: weight.id,
      name: weight.name ?? "Untitled Weight",
    })) ?? []),
  ];

  if (gameObjectId1 === gameObjectId2) {
    return null;
  }
  return (
    <RadioGroup options={options} selected={selected} onChange={handleChange} />
  );
}

import { DeleteIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { api } from "../../../utils/api";
import ConfirmAlert from "../../shared/components/ConfirmAlert";
import { GameObjectData } from "./GameObjectsTable";

export type DeleteGameObjectButtonProps = {
  gameObjectId: GameObjectData["id"];
  onDeleted?: () => void;
};

export default function DeleteGameObjectButton(
  props: DeleteGameObjectButtonProps
) {
  const { gameObjectId, onDeleted } = props;
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const utils = api.useContext();
  const gameObjectQuery = api.gameObjects.getById.useQuery({
    id: gameObjectId,
  });
  const gameObjectName =
    gameObjectQuery.data?.gameObject?.name ?? "Untitled GameObject";

  const deleteGameObjectMutation = api.gameObjects.deleteById.useMutation();
  const handleDeleteGameObject = async () => {
    onClose(); // Close the confirm alert; loading toast will notifiy the user of success/error
    const deleteDescription = `${gameObjectName} (ID=${gameObjectId})`;
    const deleteToast = toast({
      title: `Deleting GameObject...`,
      description: deleteDescription,
      status: "loading",
    });

    try {
      await deleteGameObjectMutation.mutateAsync({ id: gameObjectId });
      if (onDeleted) {
        onDeleted();
      }
      await utils.gameObjects.invalidate();

      toast.update(deleteToast, {
        title: `Success: Deleted GameObject`,
        description: deleteDescription,
        status: "success",
      });
    } catch (error) {
      console.error(error);
      toast.update(deleteToast, {
        title: `Error`,
        description: `Received an unexpected error when deleting a game object. See console for details.`,
        status: "error",
      });
    }
  };

  return (
    <>
      <ConfirmAlert
        alertTitle={`Delete GameObject?`}
        isOpen={isOpen}
        onClose={onClose}
        handleConfirm={handleDeleteGameObject}
        performingConfirmActionText="Deleting..."
      >
        <Text>
          Click &apos;Confirm&apos; to delete the following GameObject:
        </Text>
        <Text textDecoration="underline">
          {gameObjectName} (ID={gameObjectId})
        </Text>
        <Text mt="1rem" color="red.500" fontStyle="italic">
          Warning: This action cannot be undone.
        </Text>
      </ConfirmAlert>
      <Tooltip label={`Delete`} placement="top">
        <IconButton
          colorScheme="red"
          onClick={onOpen}
          icon={<DeleteIcon />}
          aria-label={`Delete gameobject with ID=${gameObjectId}`}
          size="sm"
          variant="outline"
        />
      </Tooltip>
    </>
  );
}

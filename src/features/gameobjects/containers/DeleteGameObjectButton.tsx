import { DeleteIcon } from "@chakra-ui/icons";
import { IconButton, Tooltip, useDisclosure } from "@chakra-ui/react";
import { api } from "../../../utils/api";
import { ConfirmAlert } from "../../shared/components/ConfirmAlert";
import { GameObjectData } from "./GameObjectsTable";

export type DeleteGameObjectButtonProps = {
  gameObjectId: GameObjectData["id"];
  onDeleted?: () => void;
};

export default function DeleteGameObjectButton(
  props: DeleteGameObjectButtonProps
) {
  const { gameObjectId, onDeleted } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const utils = api.useContext();
  const deleteGameObjectMutation = api.gameObjects.deleteById.useMutation();
  const handleDeleteGameObject = async () => {
    try {
      await deleteGameObjectMutation.mutateAsync({ id: gameObjectId });
      if (onDeleted) {
        onDeleted();
      }
      await utils.gameObjects.invalidate();
    } catch (error) {
      window.alert("Error deleting game object\n See console for details");
      console.error(error);
    }
  };

  return (
    <>
      <ConfirmAlert
        alertTitle={`Delete Game Object: ${gameObjectId}?`}
        isOpen={isOpen}
        onClose={onClose}
        handleConfirm={handleDeleteGameObject}
      >
        This action cannot be undone.
      </ConfirmAlert>
      <Tooltip label={`Delete`} placement="top">
        <IconButton
          colorScheme="red"
          onClick={onOpen}
          icon={<DeleteIcon />}
          aria-label={`Delete gameobject with ID: ${gameObjectId}`}
          size="sm"
          variant="outline"
        />
      </Tooltip>
    </>
  );
}

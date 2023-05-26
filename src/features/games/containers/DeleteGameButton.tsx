import { DeleteIcon } from "@chakra-ui/icons";
import { IconButton, Tooltip, useDisclosure } from "@chakra-ui/react";
import { Game } from "@prisma/client";
import { api } from "../../../utils/api";
import { ConfirmAlert } from "../../shared/components/ConfirmAlert";

export type DeleteGameButtonProps = {
  gameId: Game["id"];
  onDeleted?: () => void;
};

export default function DeleteGameButton(props: DeleteGameButtonProps) {
  const { gameId, onDeleted } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const utils = api.useContext();
  const deleteGameMutation = api.games.deleteById.useMutation();
  const handleDeleteGame = async () => {
    try {
      await deleteGameMutation.mutateAsync({ id: gameId });
      if (onDeleted) {
        onDeleted();
      }
      await utils.games.invalidate();
    } catch (error) {
      window.alert("Error deleting game\n See console for details");
      console.error(error);
    }
  };

  return (
    <>
      <ConfirmAlert
        alertTitle={`Delete Game: ${gameId}?`}
        isOpen={isOpen}
        onClose={onClose}
        handleConfirm={handleDeleteGame}
        performingConfirmActionText="Deleting..."
      >
        This action cannot be undone.
      </ConfirmAlert>
      <Tooltip label={`Delete`} placement="top">
        <IconButton
          colorScheme="red"
          onClick={onOpen}
          icon={<DeleteIcon />}
          aria-label={`Delete game with ID: ${gameId}`}
          size="sm"
          variant="outline"
        />
      </Tooltip>
    </>
  );
}

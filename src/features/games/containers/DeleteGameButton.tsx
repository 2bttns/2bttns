import { DeleteIcon } from "@chakra-ui/icons";
import { IconButton, Text, Tooltip, useDisclosure } from "@chakra-ui/react";
import { Game } from "@prisma/client";
import { api, RouterOutputs } from "../../../utils/api";
import ConfirmAlert from "../../shared/components/ConfirmAlert";

export type DeleteGameButtonProps = {
  gameId: Game["id"];
  onDeleted?: (
    deletedGame: RouterOutputs["games"]["deleteById"]["deletedGame"]
  ) => void;
};

export default function DeleteGameButton(props: DeleteGameButtonProps) {
  const { gameId, onDeleted } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const utils = api.useContext();
  const gameToDelete = api.games.getById.useQuery({ id: gameId });
  const deleteGameMutation = api.games.deleteById.useMutation();
  const handleDeleteGame = async () => {
    try {
      const { deletedGame } = await deleteGameMutation.mutateAsync({
        id: gameId,
      });
      if (onDeleted) {
        onDeleted(deletedGame);
      }
      await utils.games.invalidate();
    } catch (error) {
      window.alert("Error deleting game\n See console for details");
      console.error(error);
    }
  };

  const gameName = gameToDelete.data?.game.name ?? "Untitled Game";

  return (
    <>
      <ConfirmAlert
        alertTitle={`Delete Game?`}
        isOpen={isOpen}
        onClose={onClose}
        handleConfirm={handleDeleteGame}
        performingConfirmActionText="Deleting..."
      >
        <Text>Click &apos;Confirm&apos; to delete the following game:</Text>
        <Text textDecoration="underline">
          {gameName} (ID: {gameId})
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
          aria-label={`Delete game with ID: ${gameId}`}
          size="sm"
          variant="outline"
        />
      </Tooltip>
    </>
  );
}

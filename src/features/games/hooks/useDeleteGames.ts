import { useToast } from "@chakra-ui/react";
import { Game } from "@prisma/client";
import { api } from "../../../utils/api";

export type UseDeleteGamesConfig = {
  onDeleted?: (gameIds: Game["id"][]) => void;
};

export default function useDeleteGames(props: UseDeleteGamesConfig = {}) {
  const { onDeleted } = props;
  const toast = useToast();

  const utils = api.useContext();
  const deleteGameMutation = api.games.delete.useMutation();
  const handleDeleteGame = async (ids: Game["id"][]) => {
    if (ids.length === 0) return;

    const deleteToast = toast({
      title: `Deleting ${ids.length} game(s)`,
      status: "loading",
    });

    try {
      const idsString = ids.join(",");
      await deleteGameMutation.mutateAsync({ id: idsString });
      if (onDeleted) {
        onDeleted(ids);
      }
      await utils.games.invalidate();

      toast.update(deleteToast, {
        title: `Success: Deleted ${ids.length} game(s)`,
        status: "success",
      });
    } catch (error) {
      console.error(error);
      toast.update(deleteToast, {
        title: `Error`,
        description: `Received an unexpected error when deleting ${ids.length} game(s). See console for details.`,
        status: "error",
      });
    }
  };

  return { handleDeleteGame };
}

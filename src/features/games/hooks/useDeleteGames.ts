import { Game } from "@prisma/client";
import { api } from "../../../utils/api";

export type UseDeleteGamesConfig = {
  onDeleted?: (gameObjectIds: Game["id"][]) => void;
};

export default function useDeleteGames(props: UseDeleteGamesConfig = {}) {
  const { onDeleted } = props;
  const utils = api.useContext();
  const deleteGameMutation = api.games.delete.useMutation();
  const handleDeleteGame = async (ids: Game["id"][]) => {
    try {
      const idsString = ids.join(",");
      await deleteGameMutation.mutateAsync({ id: idsString });
      if (onDeleted) {
        onDeleted(ids);
      }
      await utils.games.invalidate();
    } catch (error) {
      window.alert("Error deleting game(s)\n See console for details");
      console.error(error);
    }
  };

  return { handleDeleteGame };
}

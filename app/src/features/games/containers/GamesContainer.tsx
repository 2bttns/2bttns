import { api, RouterInputs } from "../../../utils/api";
import Games from "../views/Games";

export type GamesContainerProps = {};

export default function GamesContainer() {
  const apiUtils = api.useContext();

  const gamesQuery = api.games.getAll.useQuery();

  const gamesCreateMutation = api.games.create.useMutation();
  const handleCreateGame = async (input: RouterInputs["games"]["create"]) => {
    const { id, name, description } = input;
    await gamesCreateMutation.mutateAsync({ id, name, description });
    apiUtils.games.invalidate();
  };

  const gamesDeleteMutation = api.games.deleteById.useMutation();
  const handleDeleteGame = async (
    input: RouterInputs["games"]["deleteById"]
  ) => {
    await gamesDeleteMutation.mutateAsync(input);
    apiUtils.games.invalidate();
  };

  const updateGameMutation = api.games.updateById.useMutation();
  const handleUpdateGame = async (
    input: RouterInputs["games"]["updateById"]
  ) => {
    await updateGameMutation.mutateAsync(input);
    apiUtils.games.invalidate();
  };

  return (
    <Games
      games={gamesQuery.data?.games ?? []}
      handleCreateGame={handleCreateGame}
      handleDeleteGame={handleDeleteGame}
      handleUpdateGame={handleUpdateGame}
    />
  );
}

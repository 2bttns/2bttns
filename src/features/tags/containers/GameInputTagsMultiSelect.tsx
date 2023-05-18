import { Game } from "@prisma/client";
import { api, RouterInputs } from "../../../utils/api";
import TagMultiSelect from "../../gameobjects/containers/TagMultiSelect";

export type GameInputTagsMultiSelectProps = {
  gameId: Game["id"];
};
export default function GameInputTagsMultiSelect(
  props: GameInputTagsMultiSelectProps
) {
  const { gameId } = props;
  const utils = api.useContext();
  const gameQuery = api.games.getById.useQuery({ id: gameId });

  const updateGameMutation = api.games.updateById.useMutation();

  const handleUpdateGame = async (
    input: RouterInputs["games"]["updateById"]
  ) => {
    await updateGameMutation.mutateAsync(input);
    await utils.games.getById.invalidate({ id: input.id });
  };

  const selectedTags = gameQuery.data?.game.inputTags.map((tag) => ({
    label: tag.name,
    value: tag.id,
  }));

  return (
    <TagMultiSelect
      selected={selectedTags ?? []}
      onChange={(nextTags) => {
        handleUpdateGame({
          id: gameId,
          data: {
            inputTags: nextTags,
          },
        });
      }}
      isEditable
    />
  );
}

import { Skeleton } from "@chakra-ui/react";
import { Game } from "@prisma/client";
import { useState } from "react";
import { api, RouterInputs } from "../../../utils/api";
import useAllTagFilters from "../hooks/useAllTagFilters";
import TagFilterToggles from "./TagFilterToggles";

export type GameInputTagsFilterTogglesProps = {
  gameId: Game["id"];
  initDelayMs?: number;
};

/**
 * A component that renders a set of tag filter toggles for a game's input tags.
 *
 * Input tags already on the game will be toggled on in the filters by default.
 *
 * Toggling a tag filter will update the game's input tags.
 */
export default function GameInputTagsFilterToggles(
  props: GameInputTagsFilterTogglesProps
) {
  const { gameId, initDelayMs = 1000 } = props;

  const utils = api.useContext();
  const tagFilters = useAllTagFilters({
    enableUntaggedFilter: false,
    defaultOn: false,
  });

  const [didInitialize, setDidInitialize] = useState(false);
  api.games.getById.useQuery(
    { id: gameId },
    {
      enabled:
        tagFilters.tagsQuery.status === "success" &&
        Object.values(tagFilters.state.tagFilter).length > 0,
      onSuccess: (data) => {
        // Once the initial filters are ready, override them so the game's existing input tags are toggled on
        tagFilters.state.setTagFilter((prevFilters) => {
          const updatedFilters = { ...prevFilters };
          Object.keys(updatedFilters).forEach((id) => {
            updatedFilters[id]!.on = false;
          });

          data.game.inputTags.forEach(({ id }) => {
            if (updatedFilters[id]) {
              updatedFilters[id]!.on = true;
            }
          });
          return updatedFilters;
        });

        // Delay the initialization of the tag filter toggles to prevent a flash of the default state
        setTimeout(() => {
          setDidInitialize(true);
        }, initDelayMs);
      },
    }
  );

  const updateGameMutation = api.games.updateById.useMutation();
  const handleUpdateGame = async (
    input: RouterInputs["games"]["updateById"]
  ) => {
    await updateGameMutation.mutateAsync(input);
    await utils.games.getById.invalidate({ id: input.id });
  };

  if (!didInitialize) {
    return <Skeleton height="24px" width="100%" />;
  }

  return (
    <TagFilterToggles
      filter={tagFilters.state.tagFilter}
      setFilter={tagFilters.state.setTagFilter}
      allAndNoneToggles
      handleChange={async (updatedTagFilter) => {
        const enabledInputTags = Object.entries(updatedTagFilter)
          .filter(([_, value]) => {
            return value.on;
          })
          .map(([id]) => {
            return id;
          });

        await handleUpdateGame({
          id: gameId,
          data: {
            inputTags: enabledInputTags,
          },
        });
      }}
    />
  );
}

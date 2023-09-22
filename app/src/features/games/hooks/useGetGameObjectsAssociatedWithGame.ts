import type { Game, Tag } from "@prisma/client";
import { useMemo } from "react";
import { api } from "../../../utils/api";

export type useGetGameObjectsAssociatedWithGameParams = {
  gameId: Game["id"];
};

export default function useGetGameObjectsAssociatedWithGame(
  params: useGetGameObjectsAssociatedWithGameParams
) {
  const { gameId } = params;

  const { data } = api.games.getById.useQuery({
    id: gameId,
    includeGameObjects: true,
  });
  const gameObjects = useMemo(() => {
    const items =
      data?.game?.inputTags?.flatMap((tag) => tag.gameObjects) ?? [];
    const uniqueItems = Array.from(new Set(items.map((item) => item.id)));
    return uniqueItems;
  }, [data?.game?.inputTags]);

  return gameObjects;
}

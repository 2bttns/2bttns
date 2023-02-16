import { Text } from "@chakra-ui/react";
import { GameObject } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../utils/api";
import Play from "../views/Play";

export type PlayContainerProps = {
  gameId: string | undefined;
};

export default function PlayContainer(props: PlayContainerProps) {
  const { gameId } = props;

  const utils = api.useContext();
  const [initCacheCleared, setCacheCleared] = useState(false);
  useEffect(() => {
    // Clear games query cache on first load; otherwise game objects may be stale
    if (initCacheCleared) return;
    (async () => {
      await utils.games.invalidate();
      setCacheCleared(true);
    })();
  }, [utils]);

  // TODO: Get round-specific game object; not all game objects
  const gamesQuery = api.games.getById.useQuery(
    { id: gameId!, includeGameObjects: true },
    {
      retry: false,
      enabled: gameId !== undefined && initCacheCleared,
      cacheTime: 0,
    }
  );

  const gameObjects = useMemo(() => {
    const gameObjects: GameObject[] = [];
    gamesQuery.data?.game.inputTags.forEach((inputTag) => {
      gameObjects.push(...inputTag.gameObjects);
    });
    return gameObjects;
  }, [gamesQuery.data]);

  if (gamesQuery.isLoading) {
    return <Text>Loading game...</Text>;
  }

  if (gamesQuery.error) {
    return null;
  }

  return <Play game={gamesQuery.data.game} gameObjects={gameObjects} />;
}

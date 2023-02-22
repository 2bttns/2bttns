import { Text } from "@chakra-ui/react";
import { Game, GameObject, Player } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../utils/api";
import { Use2bttnsMachineConfig } from "../../2bttns/ClassicMode/use2bttnsMachine";
import Play from "../views/Play";

export type PlayContainerProps = {
  gameId: Game["id"];
  playerId: Player["id"];
};

export default function PlayContainer(props: PlayContainerProps) {
  const { gameId, playerId } = props;

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
    { id: gameId, includeGameObjects: true },
    {
      retry: false,
      enabled: initCacheCleared,
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

  const processGameResultsMutation = api.games.processGameResults.useMutation();
  const handleSubmitResults: Use2bttnsMachineConfig["onFinish"] = async (
    results
  ) => {
    try {
      console.info(":: 2bttns - Results:", results);
      const result = await processGameResultsMutation.mutateAsync({
        playerId,
        results: results.map((r) => {
          return {
            not_picked: {
              gameObjectId: r.not_picked.id,
            },
            picked: {
              gameObjectId: r.picked.id,
            },
          };
        }),
      });

      console.info(":: 2bttns - Result:", result);
    } catch (error) {
      console.error(":: 2bttns - Error:", error);
    }
  };

  if (gamesQuery.isLoading) {
    return <Text>Loading game...</Text>;
  }

  if (gamesQuery.error) {
    return null;
  }

  return (
    <Play
      game={gamesQuery.data.game}
      gameObjects={gameObjects}
      onFinish={handleSubmitResults}
    />
  );
}

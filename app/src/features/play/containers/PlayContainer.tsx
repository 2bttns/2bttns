import { Text } from "@chakra-ui/react";
import { GameObject } from "@prisma/client";
import { TRPCClientErrorLike } from "@trpc/client";
import { useMemo } from "react";
import { api } from "../../../utils/api";
import Play from "../views/Play";

export type PlayContainerProps = {
  gameId: string | undefined;
  handleInvalidGame: (error: TRPCClientErrorLike<any>) => void;
};

export default function PlayContainer(props: PlayContainerProps) {
  const { gameId, handleInvalidGame } = props;

  // TODO: Get round-specific game object; not all game objects
  const gamesQuery = api.games.getById.useQuery(
    { id: gameId!, includeGameObjects: true },
    {
      retry: false,
      enabled: gameId !== undefined,
      onError: handleInvalidGame,
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

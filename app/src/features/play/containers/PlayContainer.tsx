import { Text } from "@chakra-ui/react";
import { TRPCClientErrorLike } from "@trpc/client";
import { api } from "../../../utils/api";
import Play from "../views/Play";

export type PlayContainerProps = {
  gameId: string | undefined;
  handleInvalidGame: (error: TRPCClientErrorLike<any>) => void;
};

export default function PlayContainer(props: PlayContainerProps) {
  const { gameId, handleInvalidGame } = props;

  const gamesQuery = api.games.getById.useQuery(
    { id: gameId! },
    {
      retry: false,
      enabled: gameId !== undefined,
      onError: handleInvalidGame,
    }
  );

  if (gamesQuery.isLoading) {
    return <Text>Loading game...</Text>;
  }

  if (gamesQuery.error) {
    return null;
  }

  return (
    <Play
      game={gamesQuery.data.game}
      // TODO: Get list items by game
      listItems={[]}
    />
  );
}

import { ArrowForwardIcon } from "@chakra-ui/icons";
import { IconButton, Tooltip } from "@chakra-ui/react";
import { Game } from "@prisma/client";
import { useRouter } from "next/router";

export type PlayGameButtonProps = {
  gameId: Game["id"];
};

export default function PlayGameButton(props: PlayGameButtonProps) {
  const { gameId } = props;

  const router = useRouter();
  const handlePlayGame = () => {
    router.push(`/play?game_id=${gameId}`);
  };

  return (
    <Tooltip label={`Play`} placement="top">
      <IconButton
        colorScheme="blue"
        onClick={handlePlayGame}
        icon={<ArrowForwardIcon />}
        aria-label={`Play game with ID=${gameId}`}
        size="sm"
        variant="solid"
      />
    </Tooltip>
  );
}

import { Button, Tooltip } from "@chakra-ui/react";
import { Game } from "@prisma/client";
import { useRouter } from "next/router";
import { FaFlask, FaGamepad } from "react-icons/fa";
import { ADMIN_VIEW, PLAY_URL_SEARCH_PARAMS } from "../../../pages/play";

export type TestPlayGameButtonProps = {
  gameId: Game["id"];
  view: "player" | "admin";
};

/**
 * Button to test a game at its /play route
 * Intended for use in the 2bttns Admin Console -- Supports admin and player views, while playing the game as the logged in admin
 */
export default function TestPlayGameButton(props: TestPlayGameButtonProps) {
  const { gameId, view } = props;

  const router = useRouter();
  const handlePlayGame = async () => {
    let url = `/play?game_id=${gameId}`;

    if (view === "player") {
      url += `&${PLAY_URL_SEARCH_PARAMS.ADMIN_VIEW}=${ADMIN_VIEW.PLAYER}`;
    }
    await router.push(url);
  };

  return (
    <Tooltip
      label={`Click to play this game in ${
        view === "admin" ? "admin" : "player"
      } view`}
      placement="top"
      hasArrow
    >
      <Button
        colorScheme={view === "admin" ? "yellow" : "green"}
        onClick={handlePlayGame}
        leftIcon={view === "admin" ? <FaFlask /> : <FaGamepad />}
        aria-label={`Test game ${view === "admin" ? "as admin" : "as player"}}`}
        size="sm"
        variant="solid"
      >
        {view === "admin" ? "Play (Admin View)" : "Play (Player View)"}
      </Button>
    </Tooltip>
  );
}

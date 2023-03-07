import { Heading, Stack, Text } from "@chakra-ui/react";
import { Game, GameObject } from "@prisma/client";
import ClassicMode from "../../../modes/classic/frontend/ClassicMode";
import { Use2bttnsMachineConfig } from "../../../modes/classic/frontend/ClassicMode/use2bttnsMachine";

export type PlayProps = {
  gameData: {
    game: Game;
    gameObjects: GameObject[];
  };
  onFinish: Use2bttnsMachineConfig["onFinish"];
};

export default function Play(props: PlayProps) {
  const {
    gameData: { game, gameObjects },
    onFinish,
  } = props;

  return (
    <>
      {/* TODO: swap out game modes if a frontend plugin is active for the game (e.g. Tinder-style) */}
      <Heading
        as="h1"
        sx={{
          fontSize: "48px",
          marginTop: "2rem",
          textAlign: "center",
        }}
      >
        {game?.name}
      </Heading>
      <ClassicMode
        itemPolicy={gameObjects}
        renderItem={(item) => item.name}
        hotkeys={{
          first: ["w", "ArrowUp"],
          second: ["s", "ArrowDown"],
        }}
        onFinish={onFinish}
        replace="keep-picked"
      >
        {({ button1, button2, isFinished, context, choicesRemaining }) => {
          return (
            <Stack direction="column" alignItems="center">
              {!isFinished &&
                (choicesRemaining > 0 ? (
                  <Text>{choicesRemaining} Choice(s) Remaining</Text>
                ) : (
                  <Text>Final Choice</Text>
                ))}

              <Text
                as="h1"
                sx={{
                  fontSize: "32px",
                  marginBottom: "2rem",
                  marginTop: "2rem",
                }}
              >
                {isFinished ? "Round over!" : "Which is more fun?"}
              </Text>

              {!isFinished && (
                <>
                  {button1}
                  <Text
                    sx={{
                      textTransform: "uppercase",
                      padding: "1rem",
                    }}
                  >
                    or
                  </Text>
                  {button2}
                </>
              )}
            </Stack>
          );
        }}
      </ClassicMode>
    </>
  );
}

import { Code, Heading, Stack, Text } from "@chakra-ui/react";
import { Game, GameObject } from "@prisma/client";
import ClassicMode from "../../2bttns/ClassicMode";
import { Use2bttnsMachineConfig } from "../../2bttns/ClassicMode/use2bttnsMachine";

export type PlayProps = {
  gameData: {
    game: Game;
    gameObjects: GameObject[];
    numItems: number | null;
  };
  onFinish: Use2bttnsMachineConfig["onFinish"];
};

export default function Play(props: PlayProps) {
  const {
    gameData: { game, gameObjects, numItems },
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
        items={gameObjects}
        renderItem={(item) => item.name}
        hotkeys={{
          first: ["w", "ArrowUp"],
          second: ["s", "ArrowDown"],
        }}
        onFinish={onFinish}
      >
        {({ button1, button2, isFinished, context }) => {
          return (
            <Stack direction="column" alignItems="center">
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

              {isFinished && (
                <Code
                  sx={{
                    textTransform: "uppercase",
                    padding: "1rem",
                    width: "540px",
                  }}
                >
                  {JSON.stringify(context.results, null, 2)}
                </Code>
              )}
            </Stack>
          );
        }}
      </ClassicMode>
    </>
  );
}

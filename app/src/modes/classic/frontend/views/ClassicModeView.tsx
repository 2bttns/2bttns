import { Heading, Stack, Text } from "@chakra-ui/react";
import { Game, GameObject } from "@prisma/client";
import ClassicMode from "../ClassicMode";
import { Use2bttnsMachineConfig } from "../ClassicMode/use2bttnsMachine";

export type ClassicModeViewProps = {
  game: Game;
  gameObjects: GameObject[];
  onFinish: Use2bttnsMachineConfig["onFinish"];
};

export default function ClassicModeView(props: ClassicModeViewProps) {
  const { game, gameObjects, onFinish } = props;

  return (
    <>
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

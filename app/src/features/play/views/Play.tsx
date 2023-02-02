import { Code, Heading, Stack, Text } from "@chakra-ui/react";
import { Game, ListItem } from "@prisma/client";
import ClassicMode from "../../2bttns/ClassicMode";

export type PlayProps = {
  game: Game;
  listItems: ListItem[];
};

export default function Play(props: PlayProps) {
  const { game, listItems } = props;
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
        items={listItems}
        hotkeys={{
          first: ["w", "ArrowUp"],
          second: ["s", "ArrowDown"],
        }}
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

import { Heading, Stack, Text } from "@chakra-ui/react";
import { Game } from "@prisma/client";
import ClassicMode, { ClassicModeProps } from "../ClassicMode";
import { Item } from "../ClassicMode/types";

export type ClassicModeViewProps<I extends Item> = {
  game: Game;
  itemPolicy: ClassicModeProps<I>["itemPolicy"];
  numRoundItems: ClassicModeProps<I>["numRoundItems"];
  loadItemsCallback: ClassicModeProps<I>["loadItemsCallback"];
  replacePolicy: ClassicModeProps<I>["replace"];
  onFinish: ClassicModeProps<I>["onFinish"];
};

export default function ClassicModeView<I extends Item>(
  props: ClassicModeViewProps<I>
) {
  const {
    game,
    itemPolicy,
    numRoundItems,
    onFinish,
    replacePolicy,
    loadItemsCallback,
  } = props;

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
        {game.name ?? "Untitled Game"}
      </Heading>
      <ClassicMode
        itemPolicy={itemPolicy}
        numRoundItems={numRoundItems}
        loadItemsCallback={loadItemsCallback}
        renderItem={(item) => item.name}
        hotkeys={{
          first: ["w", "ArrowUp"],
          second: ["s", "ArrowDown"],
        }}
        onFinish={onFinish}
        replace={replacePolicy}
      >
        {({
          button1,
          button2,
          isFinished,
          context,
          state,
          choicesRemaining,
        }) => {
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
              <>{state}</>

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

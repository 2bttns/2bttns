import { Heading, Stack, Text } from "@chakra-ui/react";
import { ModeUIProps } from "../../../types";
import ClassicMode, { ClassicModeProps } from "../ClassicMode";
import { Item } from "../ClassicMode/types";

export type ClassicModeViewProps<I extends Item> = {
  gameData: ModeUIProps<I>["gameData"];
  itemPolicy: ClassicModeProps<I>["itemPolicy"];
  numRoundItems: ClassicModeProps<I>["numRoundItems"];
  loadItemsCallback: ClassicModeProps<I>["loadItemsCallback"];
  replacePolicy: ClassicModeProps<I>["replace"];
  onFinish: ClassicModeProps<I>["onFinish"];
  renderItem: ClassicModeProps<I>["renderItem"];
  question?: string;
  showButtonColorBars?: boolean;
};

export default function ClassicModeView<I extends Item>(
  props: ClassicModeViewProps<I>
) {
  const {
    gameData: { game },
    itemPolicy,
    numRoundItems,
    onFinish,
    replacePolicy,
    loadItemsCallback,
    renderItem,
    question,
    showButtonColorBars,
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
        renderItem={renderItem}
        hotkeys={{
          first: ["w", "ArrowUp"],
          second: ["s", "ArrowDown"],
        }}
        showButtonColorBars={showButtonColorBars}
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
                {isFinished ? "Round over!" : question}
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

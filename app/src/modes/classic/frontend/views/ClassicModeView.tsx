import { Heading, Stack, Text } from "@chakra-ui/react";
import { Game } from "@prisma/client";
import ClassicMode from "../ClassicMode";
import { Item, ReplacePolicy } from "../ClassicMode/types";
import { Use2bttnsMachineConfig } from "../ClassicMode/use2bttnsMachine";

export type ClassicModeViewProps<I extends Item> = {
  game: Game;
  items: Use2bttnsMachineConfig<I>["items"];
  onFinish: Use2bttnsMachineConfig<I>["onFinish"];
  replacePolicy: ReplacePolicy;
  loadItemsOnDemandCallback?: Use2bttnsMachineConfig<I>["loadItemsOnDemandCallback"];
};

export default function ClassicModeView<I extends Item>(
  props: ClassicModeViewProps<I>
) {
  const { game, items, onFinish, replacePolicy, loadItemsOnDemandCallback } =
    props;

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
        items={items}
        renderItem={(item) => item.name}
        hotkeys={{
          first: ["w", "ArrowUp"],
          second: ["s", "ArrowDown"],
        }}
        onFinish={onFinish}
        replace={replacePolicy}
        loadItemsOnDemandCallback={loadItemsOnDemandCallback}
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

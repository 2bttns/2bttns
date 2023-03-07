import { Heading, Stack, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { ModeUIProps } from "../../../types";
import ClassicMode from "../ClassicMode";
import {
  Item,
  ItemPolicy,
  LoadOnDemandItemPolicy,
  PreloadItemPolicy,
  ReplacePolicy,
} from "../ClassicMode/types";
import {
  LoadItemsOnDemandCallback,
  Use2bttnsMachineConfig,
} from "../ClassicMode/use2bttnsMachine";

export type ClassicModeViewProps<I extends Item> = {
  gameData: ModeUIProps<any>["gameData"];
  onFinish: Use2bttnsMachineConfig<I>["onFinish"];
  replacePolicy: ReplacePolicy;
  loadItemsOnDemandCallback?: LoadItemsOnDemandCallback<I>;
};

export default function ClassicModeView<I extends Item>(
  props: ClassicModeViewProps<I>
) {
  const { gameData, onFinish, replacePolicy, loadItemsOnDemandCallback } =
    props;

  const formattedItems: ItemPolicy<any> = useMemo(() => {
    switch (gameData.gameObjects.type) {
      case "preload":
        return {
          type: "preload",
          payload: { item_queue: gameData.gameObjects.payload.gameObjects },
        } as PreloadItemPolicy<any>;
      case "load-on-demand":
        return {
          type: "load-on-demand",
          payload: {
            totalNumItemsToLoad:
              gameData.gameObjects.payload.totalNumItemsToLoad,
          },
        } as LoadOnDemandItemPolicy<any>;
    }
  }, [gameData.gameObjects]);

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
        {gameData.game.name ?? "Untitled Game"}
      </Heading>
      <ClassicMode
        items={formattedItems}
        renderItem={(item) => item.name}
        hotkeys={{
          first: ["w", "ArrowUp"],
          second: ["s", "ArrowDown"],
        }}
        onFinish={onFinish}
        replace={replacePolicy}
        loadItemsOnDemandCallback={loadItemsOnDemandCallback}
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

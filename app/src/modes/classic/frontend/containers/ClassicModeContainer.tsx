import { Box, Code, Text } from "@chakra-ui/react";
import { GameObject } from "@prisma/client";
import Link from "next/link";
import { api, apiClient } from "../../../../utils/api";
import { ModeUIProps } from "../../../types";
import { Item, ItemPolicyType, ReplacePolicy } from "../ClassicMode/types";
import { Use2bttnsMachineConfig } from "../ClassicMode/use2bttnsMachine";
import { useGameCallbackRedirect } from "../hooks/useGameCallbackRedirect";
import ClassicModeView, {
  ClassicModeViewProps,
} from "../views/ClassicModeView";

export const defaultItemPolicy: ItemPolicyType = "load-on-demand";
export const defaultReplacePolicy: ReplacePolicy = "keep-picked";

export type ClassicModeContainerProps = ModeUIProps<{
  itemPolicy?: ItemPolicyType;
  replacePolicy?: ReplacePolicy;
  question?: ClassicModeViewProps<Item>["question"];
  showColorBarOnButtons?: ClassicModeViewProps<Item>["showButtonColorBars"];
}>;

export default function ClassicModeContainer(props: ClassicModeContainerProps) {
  const {
    config: { itemPolicy, replacePolicy, question, showColorBarOnButtons },
    gameData,
  } = props;

  const { isRedirecting, redirectToCallbackUrl } = useGameCallbackRedirect({
    callbackUrl: gameData.callbackUrl,
  });

  const processGameResultsMutation =
    api.modes.modeBackendRouter.classicMode.processGameResults.useMutation();
  const handleFinish: Use2bttnsMachineConfig<GameObject>["onFinish"] = async (
    results
  ) => {
    try {
      console.info(":: 2bttns - Results:", results);
      const result = await processGameResultsMutation.mutateAsync({
        playerId: gameData.playerId,
        results: results.map((r) => {
          return {
            not_picked: {
              gameObjectId: r.not_picked.id,
            },
            picked: {
              gameObjectId: r.picked.id,
            },
          };
        }),
      });

      console.info(":: 2bttns - Result:", result);
      redirectToCallbackUrl();
    } catch (error) {
      console.error(":: 2bttns - Error:", error);
    }
  };

  const loadItemsCallback: ClassicModeViewProps<GameObject>["loadItemsCallback"] =
    async (count, exclude) => {
      // TODO: Get items based on a "next item policy" such as "top-rated", "random", "discover-new", etc.
      const { results } =
        await apiClient.modes.modeBackendRouter.classicMode.getRandomGameObjects.query(
          {
            count: count,
            tags: gameData.game.inputTags.map((t) => t.id),
            excludedGameObjectIds: exclude?.map((item) => item.id) ?? [],
          }
        );
      return results;
    };

  return (
    <Box height="100%" bgColor="white">
      <ClassicModeView
        gameData={gameData}
        itemPolicy={itemPolicy ?? defaultItemPolicy}
        numRoundItems={gameData.numRoundItems}
        replacePolicy={replacePolicy ?? defaultReplacePolicy}
        onFinish={handleFinish}
        loadItemsCallback={loadItemsCallback}
        renderItem={(item) => item.name}
        question={question}
        showButtonColorBars={showColorBarOnButtons}
      />
      {gameData.callbackUrl && isRedirecting && (
        <Box
          textAlign="center"
          maxWidth="500px"
          marginX="auto"
          marginTop="1remw"
          color="twobttns.darktext"
        >
          <Text display="inline">
            Returning to <Code>{gameData.callbackUrl}</Code>.{" "}
          </Text>
          <Text display="inline">If you are not redirected, </Text>
          <Link href={gameData.callbackUrl}>
            <Text color="blue.500" fontWeight="bold" display="inline">
              click here{" "}
            </Text>
          </Link>
          <Text display="inline">to return immediately.</Text>
        </Box>
      )}
    </Box>
  );
}

import { GameObject } from "@prisma/client";
import { api, apiClient } from "../../../../utils/api";
import { ModeUIProps } from "../../../types";
import { ItemPolicyType, ReplacePolicy } from "../ClassicMode/types";
import { Use2bttnsMachineConfig } from "../ClassicMode/use2bttnsMachine";
import ClassicModeView, {
  ClassicModeViewProps,
} from "../views/ClassicModeView";

export const defaultReplacePolicy: ReplacePolicy = "keep-picked";

export type ClassicModeContainerProps = ModeUIProps<{
  itemPolicy: ItemPolicyType;
  replacePolicy?: ReplacePolicy;
}>;

export default function ClassicModeContainer(props: ClassicModeContainerProps) {
  const {
    config: { itemPolicy = "load-on-demand", replacePolicy },
    gameData,
  } = props;

  const processGameResultsMutation =
    api.modes.modeBackendRouter.classicMode.processGameResults.useMutation();
  const handleSubmitResults: Use2bttnsMachineConfig<GameObject>["onFinish"] =
    async (results) => {
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
      } catch (error) {
        console.error(":: 2bttns - Error:", error);
      }
    };

  const loadItemsCallback: ClassicModeViewProps<GameObject>["loadItemsCallback"] =
    async (count) => {
      const { results } =
        await apiClient.modes.modeBackendRouter.classicMode.getRandomGameObjects.query(
          {
            count: count,
            tags: gameData.game.inputTags.map((t) => t.id),
          }
        );
      return results;
    };

  return (
    <ClassicModeView
      game={gameData.game}
      itemPolicy={itemPolicy}
      numRoundItems={gameData.numRoundItems}
      replacePolicy={replacePolicy ?? defaultReplacePolicy}
      onFinish={handleSubmitResults}
      loadItemsCallback={loadItemsCallback}
    />
  );
}

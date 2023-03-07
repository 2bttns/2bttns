import { GameObject } from "@prisma/client";
import { api, apiClient } from "../../../../utils/api";
import { ModeUIProps } from "../../../types";
import { ReplacePolicy } from "../ClassicMode/types";
import { Use2bttnsMachineConfig } from "../ClassicMode/use2bttnsMachine";
import ClassicModeView, {
  ClassicModeViewProps,
} from "../views/ClassicModeView";

export const defaultReplacePolicy: ReplacePolicy = "keep-picked";

export type ClassicModeContainerProps = ModeUIProps<{
  replacePolicy?: ReplacePolicy;
}>;

export default function ClassicModeContainer(props: ClassicModeContainerProps) {
  const {
    config: { replacePolicy },
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

  const loadItemsOnDemandCallback: ClassicModeViewProps<GameObject>["loadItemsOnDemandCallback"] =
    async (count) => {
      // TODO: FIlter by tag & exclude seen gameObjects
      const { results } =
        await apiClient.modes.modeBackendRouter.classicMode.getRandomGameObjects.query(
          {
            numGameObjects: count,
          }
        );
      return results;
    };

  return (
    <ClassicModeView
      gameData={gameData}
      replacePolicy={replacePolicy ?? defaultReplacePolicy}
      onFinish={handleSubmitResults}
      loadItemsOnDemandCallback={loadItemsOnDemandCallback}
    />
  );
}

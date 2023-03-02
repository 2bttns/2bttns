import { Player } from "@prisma/client";
import { api } from "../../../../utils/api";
import { ModeUIProps } from "../../../types";
import { Use2bttnsMachineConfig } from "../ClassicMode/use2bttnsMachine";
import ClassicModeView from "../views/ClassicModeView";

export interface ClassicModeContainerProps extends ModeUIProps {
  playerId: Player["id"];
}

export default function ClassicModeContainer(props: ClassicModeContainerProps) {
  const { playerId, gameData } = props;

  const processGameResultsMutation =
    api.modes.classicMode.processGameResults.useMutation();
  const handleSubmitResults: Use2bttnsMachineConfig["onFinish"] = async (
    results
  ) => {
    try {
      console.info(":: 2bttns - Results:", results);
      const result = await processGameResultsMutation.mutateAsync({
        playerId,
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

  return (
    <ClassicModeView
      game={gameData.game}
      gameObjects={gameData.gameObjects}
      onFinish={handleSubmitResults}
    />
  );
}

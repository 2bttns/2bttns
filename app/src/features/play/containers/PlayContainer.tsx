import { Player } from "@prisma/client";
import { api } from "../../../utils/api";
import { Use2bttnsMachineConfig } from "../../2bttns/ClassicMode/use2bttnsMachine";
import Play, { PlayProps } from "../views/Play";

export type PlayContainerProps = {
  playerId: Player["id"];
  gameData: PlayProps["gameData"];
};

export default function PlayContainer(props: PlayContainerProps) {
  const { playerId, gameData } = props;

  const processGameResultsMutation = api.games.processGameResults.useMutation();
  const handleSubmitResults: Use2bttnsMachineConfig["onFinish"] = async (
    results
  ) => {
    try {
      console.info(":: 2bttns - Results:", results);
      // const result = await processGameResultsMutation.mutateAsync({
      //   playerId,
      //   results: results.map((r) => {
      //     return {
      //       not_picked: {
      //         gameObjectId: r.not_picked.id,
      //       },
      //       picked: {
      //         gameObjectId: r.picked.id,
      //       },
      //     };
      //   }),
      // });
      //
      // console.info(":: 2bttns - Result:", result);
    } catch (error) {
      console.error(":: 2bttns - Error:", error);
    }
  };

  return <Play gameData={gameData} onFinish={handleSubmitResults} />;
}

import { Box, HStack, Select, Text, VStack } from "@chakra-ui/react";
import { Game } from "@prisma/client";
import { useState } from "react";
import { AvailableModes, availableModes } from "../../../modes/availableModes";
import { getModeUI } from "../../../modes/modesUIRegistry";
import { ConfigComponentProps } from "../../../modes/types";
import { api, RouterInputs } from "../../../utils/api";

type EditGameModeProps = {
  gameId: Game["id"];
};

export default function EditGameMode(props: EditGameModeProps) {
  const { gameId } = props;

  const [selectedMode, setSelectedMode] = useState<AvailableModes | null>(null);
  const [modeConfig, setModeConfig] =
    useState<ConfigComponentProps<any>["config"]>(null);

  const ConfigComponent = selectedMode
    ? getModeUI(selectedMode).ConfigComponent
    : null;

  const utils = api.useContext();
  api.games.getById.useQuery(
    { id: gameId },
    {
      retry: false,
      onSuccess: ({ game: { mode, modeConfigJson } }) => {
        const config = modeConfigJson ? JSON.parse(modeConfigJson) : {};
        setModeConfig(config);
        setSelectedMode(mode as AvailableModes);
      },
    }
  );

  const updateGameMutation = api.games.updateById.useMutation();
  const handleUpdateGame = async (
    input: RouterInputs["games"]["updateById"]
  ) => {
    try {
      await updateGameMutation.mutateAsync(input);
      await utils.games.getById.invalidate({ id: input.id });
    } catch (error) {
      console.error(error);
      window.alert("Error updating game. See console for details.");
    }
  };

  const handleSelectChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const mode = event.target.value as AvailableModes;
    await handleUpdateGame({ id: gameId, data: { mode } });
    await utils.games.getById.invalidate({ id: gameId });
  };

  return (
    <VStack spacing="1rem" width="100%" alignItems="start">
      <HStack>
        <Text fontWeight="bold">Game Mode:</Text>

        {selectedMode && (
          <Box width="256px">
            <Select
              value={selectedMode}
              sx={{ backgroundColor: "white" }}
              onChange={handleSelectChange}
            >
              {availableModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </Select>
          </Box>
        )}
      </HStack>
      {ConfigComponent && modeConfig && (
        <ConfigComponent
          config={modeConfig}
          onConfigChange={async (updatedConfig) => {
            await handleUpdateGame({
              id: gameId,
              data: {
                modeConfigJson: JSON.stringify(updatedConfig),
              },
            });
          }}
        />
      )}
    </VStack>
  );
}

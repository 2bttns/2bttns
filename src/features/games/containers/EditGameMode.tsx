///
/// Component for editing a game based on its available mode configuration options
/// For example, "classic" mode uses certain configuration options like "itemPolicy".
/// This pattern supports the addition of new modes with custom configurations in the future.
///

import {
  Box,
  Heading,
  Select,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { Game } from "@prisma/client";
import { useMemo, useState } from "react";
import { AvailableModes, availableModes } from "../../../modes/availableModes";
import { getModeUI } from "../../../modes/modesUIRegistry";
import { ConfigComponentProps } from "../../../modes/types";
import { api, RouterInputs } from "../../../utils/api";
import CustomEditable from "../../shared/components/CustomEditable";

type EditGameModeProps = {
  gameId: Game["id"];
};

export default function EditGameMode(props: EditGameModeProps) {
  const { gameId } = props;

  const toast = useToast();

  const [selectedMode, setSelectedMode] = useState<AvailableModes | null>(null);
  const [modeConfig, setModeConfig] =
    useState<ConfigComponentProps<any>["config"]>(null);

  const ConfigComponent = useMemo(() => {
    if (!selectedMode) return null;
    return getModeUI(selectedMode)?.ConfigComponent;
  }, [selectedMode]);

  const utils = api.useContext();

  const [didMount, setDidMount] = useState(false);

  const gameQuery = api.games.getById.useQuery(
    { id: gameId },
    {
      retry: false,
      onSuccess: ({ game: { mode, modeConfigJson } }) => {
        const config = modeConfigJson ? JSON.parse(modeConfigJson) : {};
        setModeConfig(config);
        setSelectedMode(mode as AvailableModes);
        setDidMount(true);
      },
    }
  );

  const updateGameMutation = api.games.updateById.useMutation();
  const handleUpdateGame = async (
    input: RouterInputs["games"]["updateById"]
  ) => {
    let updateDescription = `Saving changes...`;
    const updateToast = toast({
      title: "Updating Game",
      status: "loading",
      description: updateDescription,
    });
    try {
      await updateGameMutation.mutateAsync(input);
      await utils.games.getById.invalidate({ id: input.id });

      updateDescription = ``;
      toast.update(updateToast, {
        title: "Saved",
        status: "success",
        description: updateDescription,
      });
    } catch (error) {
      updateDescription = `Failed to update (Game ID=${gameId}). See console for details`;
      toast.update(updateToast, {
        title: "Error",
        status: "error",
        description: updateDescription,
      });
      console.error(error);
    }
  };

  const handleChangeMode = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const mode = event.target.value as AvailableModes;
    if (!mode) return;
    await handleUpdateGame({ id: gameId, data: { mode } });
    await utils.games.getById.invalidate({ id: gameId });
  };

  return (
    <>
      <TableContainer>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>
                <Heading size="md">Mode Configuration</Heading>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td fontWeight="bold">Game Mode</Td>
              <Td>
                <Box width="256px">
                  {!didMount ? (
                    <>
                      <Skeleton width="100%" height="24px" />
                    </>
                  ) : (
                    <Select
                      value={selectedMode ?? undefined}
                      sx={{ backgroundColor: "white" }}
                      onChange={handleChangeMode}
                    >
                      <option key={"<no-selection>"} value={undefined}>
                        &lt;No Selection&gt;
                      </option>
                      {availableModes.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </Select>
                  )}
                </Box>
              </Td>
            </Tr>
            <Tr>
              <Td>Round Length</Td>
              <Td verticalAlign="top">
                <CustomEditable
                  value={
                    gameQuery.data?.game.defaultNumItemsPerRound?.toString() ??
                    ""
                  }
                  placeholder="ALL"
                  handleSave={async (nextValue) => {
                    // Null means ALL
                    // Otherwise this must be a number greater than 0
                    let value: Game["defaultNumItemsPerRound"] = null;
                    if (nextValue !== "") {
                      try {
                        const parsed = parseInt(nextValue, 10);
                        if (isNaN(parsed)) throw new Error("Must be a number");
                        if (parsed <= 0)
                          throw new Error("Must be greater than 0");
                        value = parsed;
                      } catch (error) {
                        throw error;
                      }
                    }
                    await handleUpdateGame({
                      id: gameId,
                      data: {
                        defaultNumItemsPerRound: value,
                      },
                    });
                  }}
                />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>

      {didMount && (
        <Box mt="1rem">
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
        </Box>
      )}
    </>
  );
}

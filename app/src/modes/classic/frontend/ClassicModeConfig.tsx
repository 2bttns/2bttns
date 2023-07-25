import {
  Box,
  Code,
  Heading,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction, useState } from "react";
import UnderlinedTextTooltip from "../../../features/shared/components/UnderlinedTextTooltip";
import { ConfigComponentProps } from "../../types";
import { ItemPolicyType, ReplacePolicy } from "./ClassicMode/types";
import {
  ClassicModeContainerProps,
  defaultItemPolicy,
  defaultReplacePolicy,
} from "./containers/ClassicModeContainer";

export const replacePolicies: ReplacePolicy[] = [
  "keep-picked",
  "replace-picked",
  "replace-all",
];

export const itemPolicies: ItemPolicyType[] = ["load-on-demand", "preload"];

export type ClassicModeConfigProps = ConfigComponentProps<
  ClassicModeContainerProps["config"]
>;

export default function ClassicModeConfig(props: ClassicModeConfigProps) {
  const [config, setConfig] = useState<ClassicModeContainerProps["config"]>({
    ...props.config,
  });

  return (
    <>
      <TableContainer>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>
                <Heading size="md">Mode Configuration: Classic</Heading>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <ConfigItemPolicy
              modeProps={props}
              config={config}
              setConfig={setConfig}
            />
            <ConfigReplacePolicy
              modeProps={props}
              config={config}
              setConfig={setConfig}
            />
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}

export interface BaseConfigMenuProps {
  modeProps: ClassicModeConfigProps;
  config: ClassicModeContainerProps["config"];
  setConfig: Dispatch<SetStateAction<ClassicModeContainerProps["config"]>>;
}

function ConfigItemPolicy({
  modeProps,
  config,
  setConfig,
}: BaseConfigMenuProps) {
  const handleItemPolicyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setConfig((prev) => {
      const updatedConfig: ClassicModeContainerProps["config"] = {
        ...prev,
        itemPolicy: event.target.value as ItemPolicyType,
      };
      modeProps.onConfigChange(updatedConfig);
      return updatedConfig;
    });
  };

  return (
    <Tr>
      <Td>
        <UnderlinedTextTooltip
          tooltipProps={{
            label: (
              <VStack
                spacing={2}
                alignItems="start"
                fontSize="12px"
                padding="1rem"
              >
                <Text fontWeight="bold">CLASSIC MODE - ITEM POLICY</Text>
                <Text>
                  Choose how Classic mode should load Game Objects when playing
                  the Game.
                </Text>
                <Box>
                  <Code>load-on-demand</Code>
                  <Text>Load Game Objects dynamically after each pick.</Text>
                </Box>
                <Box>
                  <Code>preload</Code>
                  <Text>Preload all Game Objects before the Game starts.</Text>
                </Box>
              </VStack>
            ),
          }}
        >
          Item Policy
        </UnderlinedTextTooltip>
      </Td>
      <Td>
        <Box>
          <Select
            onChange={handleItemPolicyChange}
            value={config.itemPolicy ?? defaultItemPolicy}
            bgColor="white"
          >
            {itemPolicies.map((option, i) => (
              <option value={option} key={i}>
                {option}
              </option>
            ))}
          </Select>
        </Box>
      </Td>
    </Tr>
  );
}

function ConfigReplacePolicy({
  modeProps,
  config,
  setConfig,
}: BaseConfigMenuProps) {
  const handleReplacePolicyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setConfig((prev) => {
      const updatedConfig: ClassicModeContainerProps["config"] = {
        ...prev,
        replacePolicy: event.target.value as ReplacePolicy,
      };
      modeProps.onConfigChange(updatedConfig);
      return updatedConfig;
    });
  };

  return (
    <Tr>
      <Td>
        <UnderlinedTextTooltip
          tooltipProps={{
            label: (
              <VStack
                spacing={2}
                alignItems="start"
                fontSize="12px"
                padding="1rem"
              >
                <Text fontWeight="bold">CLASSIC MODE - REPLACE POLICY</Text>
                <Text>
                  Choose how Classic mode should replace Game Objects with new
                  options during the Game.
                </Text>
                <Box>
                  <Code>keep-picked</Code>
                  <Text>Keep the picked Game Object and replace the rest.</Text>
                </Box>
                <Box>
                  <Code>replace-picked</Code>
                  <Text>Replace the picked Game Object and keep the rest.</Text>
                </Box>
                <Box>
                  <Code>replace-all</Code>
                  <Text>Replace all Game Objects with new options.</Text>
                </Box>
              </VStack>
            ),
          }}
        >
          Replace Policy
        </UnderlinedTextTooltip>
      </Td>
      <Td>
        <Select
          onChange={handleReplacePolicyChange}
          value={config.replacePolicy ?? defaultReplacePolicy}
          bgColor="white"
        >
          {replacePolicies.map((option, i) => (
            <option value={option} key={i}>
              {option}
            </option>
          ))}
        </Select>
      </Td>
    </Tr>
  );
}

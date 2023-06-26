import {
  Box,
  Heading,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useState } from "react";
import { ConfigComponentProps } from "../../types";
import { ItemPolicyType, ReplacePolicy } from "./ClassicMode/types";
import {
  ClassicModeContainerProps,
  defaultItemPolicy,
  defaultReplacePolicy,
} from "./containers/ClassicModeContainer";

const replacePolicies: ReplacePolicy[] = [
  "keep-picked",
  "replace-picked",
  "replace-all",
];

const itemPolicies: ItemPolicyType[] = ["load-on-demand", "preload"];

export default function ClassicModeConfig(
  props: ConfigComponentProps<ClassicModeContainerProps["config"]>
) {
  const [config, setConfig] = useState<ClassicModeContainerProps["config"]>({
    ...props.config,
  });

  const handleItemPolicyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setConfig((prev) => {
      const updatedConfig: ClassicModeContainerProps["config"] = {
        ...prev,
        itemPolicy: event.target.value as ItemPolicyType,
      };
      props.onConfigChange(updatedConfig);
      return updatedConfig;
    });
  };

  const handleReplacePolicyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setConfig((prev) => {
      const updatedConfig: ClassicModeContainerProps["config"] = {
        ...prev,
        replacePolicy: event.target.value as ReplacePolicy,
      };
      props.onConfigChange(updatedConfig);
      return updatedConfig;
    });
  };

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
            <Tr>
              <Td>Item Policy</Td>
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
            <Tr>
              <Td>Replace Policy</Td>
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
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}

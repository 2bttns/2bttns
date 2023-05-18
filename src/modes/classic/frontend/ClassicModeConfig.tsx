import { HStack, Select, Stack, Text } from "@chakra-ui/react";
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
    <Stack direction="column" spacing="1rem" width="100%">
      <HStack maxWidth="512px">
        <Text fontWeight="bold" minWidth="128px">
          Item Policy:
        </Text>
        <Select
          onChange={handleItemPolicyChange}
          value={config.itemPolicy ?? defaultItemPolicy}
          sx={{ backgroundColor: "white" }}
        >
          {itemPolicies.map((option, i) => (
            <option value={option} key={i}>
              {option}
            </option>
          ))}
        </Select>
      </HStack>

      <HStack maxWidth="512px">
        <Text fontWeight="bold" minWidth="128px">
          Replace Policy:
        </Text>
        <Select
          onChange={handleReplacePolicyChange}
          value={config.replacePolicy ?? defaultReplacePolicy}
          sx={{ backgroundColor: "white" }}
        >
          {replacePolicies.map((option, i) => (
            <option value={option} key={i}>
              {option}
            </option>
          ))}
        </Select>
      </HStack>
    </Stack>
  );
}

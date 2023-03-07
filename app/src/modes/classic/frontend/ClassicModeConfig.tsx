import { Select } from "@chakra-ui/react";
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
    <div>
      <Select
        onChange={handleReplacePolicyChange}
        value={config.replacePolicy ?? defaultReplacePolicy}
        sx={{ backgroundColor: "white" }}
      >
        {replacePolicies.map((options) => (
          <option value={options}>{options}</option>
        ))}
      </Select>
      <Select
        onChange={handleItemPolicyChange}
        value={config.itemPolicy ?? defaultItemPolicy}
        sx={{ backgroundColor: "white" }}
      >
        {itemPolicies.map((option) => (
          <option value={option}>{option}</option>
        ))}
      </Select>
    </div>
  );
}

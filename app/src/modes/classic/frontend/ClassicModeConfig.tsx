import { Select } from "@chakra-ui/react";
import { useState } from "react";
import { ConfigComponentProps } from "../../types";
import { ReplacePolicy } from "./ClassicMode/types";
import {
  ClassicModeContainerProps,
  defaultReplacePolicy,
} from "./containers/ClassicModeContainer";

const replacePolicies: ReplacePolicy[] = [
  "keep-picked",
  "replace-picked",
  "replace-all",
];

export default function ClassicModeConfig(
  props: ConfigComponentProps<ClassicModeContainerProps["config"]>
) {
  const [config, setConfig] = useState<ClassicModeContainerProps["config"]>({
    ...props.config,
  });

  const handleReplacePolicyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setConfig((prev) => {
      const updatedConfig = {
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
        {replacePolicies.map((policy) => (
          <option value={policy}>{policy}</option>
        ))}
      </Select>
    </div>
  );
}

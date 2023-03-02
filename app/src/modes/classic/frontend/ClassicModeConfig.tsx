import { Select } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ConfigComponentProps } from "../../types";
import { ReplacePolicy } from "./ClassicMode/types";
import { ClassicModeContainerProps } from "./containers/ClassicModeContainer";

const replacePolicies: ReplacePolicy[] = [
  "keep-picked",
  "replace-picked",
  "replace-all",
];

export default function ClassicModeConfig(
  props: ConfigComponentProps<ClassicModeContainerProps>
) {
  const [config, setConfig] = useState<ClassicModeContainerProps["config"]>(
    props.config
  );

  useEffect(() => {
    props.onConfigChange(config);
  }, [config]);

  const handleReplacePolicyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setConfig({
      ...config,
      replacePolicy: event.target.value as ReplacePolicy,
    });
  };

  return (
    <div>
      <Select onChange={handleReplacePolicyChange} value={config.replacePolicy}>
        {replacePolicies.map((policy) => (
          <option value={policy}>{policy}</option>
        ))}
      </Select>
    </div>
  );
}

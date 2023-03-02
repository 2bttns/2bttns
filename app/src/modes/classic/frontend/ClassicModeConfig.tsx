import { useEffect, useState } from "react";
import { ConfigComponentProps } from "../../types";
import { ClassicModeContainerProps } from "./containers/ClassicModeContainer";

export default function ClassicModeConfig(
  props: ConfigComponentProps<ClassicModeContainerProps>
) {
  const { onConfigChange, ...rest } = props;
  const [config, setConfig] = useState<ClassicModeContainerProps>(rest);

  useEffect(() => {
    onConfigChange(config);
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <label htmlFor="name">Name</label>
      {/* <input
        type="text"
        name="name"
        value={config.name}
        onChange={handleChange}
      /> */}
    </div>
  );
}

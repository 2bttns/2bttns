import { useEffect, useState } from "react";
import { ClassicModeProps } from "./ClassicMode";

export type ClassicModeConfigProps = ClassicModeProps & {
  onConfigChange: (config: ClassicModeProps) => void;
};

export default function ClassicModeConfig(props: ClassicModeConfigProps) {
  const { onConfigChange, ...rest } = props;
  const [config, setConfig] = useState<ClassicModeProps>(rest);

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
      <input
        type="text"
        name="name"
        value={config.name}
        onChange={handleChange}
      />
    </div>
  );
}

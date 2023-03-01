import { Mode } from "./../_index";
import ClassicMode, { ClassicModeProps } from "./ClassicMode";

export const classicMode: Mode<ClassicModeProps> = {
  name: "Classic Mode",
  FrontendComponent: ClassicMode,
  ConfigComponent: ClassicMode,
  backendMiddleware: (props: ClassicModeProps) => {
    console.log("Classic mode backend middleware", props);
  },
};

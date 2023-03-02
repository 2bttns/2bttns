import { ModeUI } from "../../types";
import ClassicModeConfig from "./ClassicModeConfig";
import ClassicModeContainer, {
  ClassicModeContainerProps,
} from "./containers/ClassicModeContainer";

export const classicMode: ModeUI<ClassicModeContainerProps> = {
  FrontendComponent: ClassicModeContainer,
  ConfigComponent: ClassicModeConfig,
};

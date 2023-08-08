import { TwobttnsTutorialsProps } from "../TwobttnsTutorials";

export type TwobttnsTutorial = {
  id: string;
  steps: TwobttnsTutorialsProps["steps"];
  onJoyrideCallback?: TwobttnsTutorialsProps["onJoyrideCallback"];
};

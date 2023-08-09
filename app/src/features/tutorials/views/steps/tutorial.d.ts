import { TwobttnsTutorialsProps } from "../TwobttnsTutorials";

/**
 * Tutorials in the 2bttns admin console use the following structure.
 * Steps are just react-joyride steps. The onJoyrideCallback has access to internal states of joyride as well
 *  as additional funcitonality like the Next.js router, allowing robust tutorial functionality such as starting a tutorial from a specific step on a new page
 */
export type TwobttnsTutorial = {
  id: string;
  steps: TwobttnsTutorialsProps["steps"];
  onJoyrideCallback?: TwobttnsTutorialsProps["onJoyrideCallback"];
};

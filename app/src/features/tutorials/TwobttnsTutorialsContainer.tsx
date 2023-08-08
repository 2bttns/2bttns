import { useTwoBttnsTutorialsContext } from "./TwobttnsTutorialsContextProvider";
import TwobttnsTutorials from "./views/TwobttnsTutorials";

export default function TwobttnsTutorialsContainer() {
  const context = useTwoBttnsTutorialsContext();

  if (!context.tutorial) {
    return null;
  }

  return (
    <TwobttnsTutorials
      steps={context.tutorial.steps}
      onJoyrideCallback={context.tutorial?.onJoyrideCallback}
    />
  );
}

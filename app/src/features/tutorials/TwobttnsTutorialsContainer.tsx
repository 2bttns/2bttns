import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  TwobttnsTutorialId,
  useTwoBttnsTutorialsContext,
} from "./TwobttnsTutorialsContextProvider";
import { tutorialsRegistry } from "./views/steps/tutorialsRegistry";
import TwobttnsTutorials from "./views/TwobttnsTutorials";

export default function TwobttnsTutorialsContainer() {
  const context = useTwoBttnsTutorialsContext();
  const tutorial = context.tutorialId
    ? tutorialsRegistry[context.tutorialId]
    : null;

  const searchParams = useSearchParams();
  useEffect(() => {
    const searchParamsDict = Object.fromEntries(searchParams.entries());
    const tutorialQueryId = searchParamsDict["tutorial"];
    if (tutorialQueryId === context.tutorialId) return;
    if (tutorialsRegistry[tutorialQueryId as TwobttnsTutorialId]) {
      context.setTutorialId(searchParamsDict["tutorial"] as TwobttnsTutorialId);
    } else {
      context.clearTutorial();
    }
  }, [searchParams]);

  if (!tutorial) {
    return null;
  }

  return (
    <TwobttnsTutorials
      steps={tutorial.steps}
      onJoyrideCallback={tutorial?.onJoyrideCallback}
    />
  );
}

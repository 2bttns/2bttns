import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  TwobttnsTutorialId,
  useTwoBttnsTutorialsContext,
} from "./TwobttnsTutorialsContextProvider";
import { tutorialsRegistry } from "./views/steps/tutorialsRegistry";
import TwobttnsTutorials from "./views/TwobttnsTutorials";

/**
 * The 2bttns admin console implementation for tutorials uses React-Joyride, React Context, and URL query parameters.
 * For example, navigating to a page with the added URL query parameter `?tutorial=homePageTutorial&step=1` will trigger that tutorial to start at step 1.
 */
export default function TwobttnsTutorialsContainer() {
  const context = useTwoBttnsTutorialsContext();
  const tutorial = context.tutorialId
    ? tutorialsRegistry[context.tutorialId]
    : null;

  const searchParams = useSearchParams();
  useEffect(() => {
    // Update the tutorial context with the latest tutorial ID query parameter, if it has changed
    // The ID corresponds to the tutorial's key in the tutorialsRegistry
    //  For example, ?tutorial=homePageTutorial&step=1 will trigger the registered tutorial with the key "homePageTutorial" to start at step 1
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

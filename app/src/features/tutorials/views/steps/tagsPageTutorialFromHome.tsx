import { ACTIONS as JOYRIDE_ACTIONS } from "react-joyride";
import { TUTORIAL_BUTTON_ID } from "../TwobttnsTutorials";
import { TwobttnsTutorial } from "./tutorial";
import { tutorialsRegistry } from "./tutorialsRegistry";

export const tagsPageTutorialFromHome: TwobttnsTutorial = {
  id: "tagsPageTutorialFromHome",
  steps: [
    {
      target: `#${TUTORIAL_BUTTON_ID}`,
      content: "This is the Tags management page.",
      disableBeacon: true,
    },
    {
      target: `#${TUTORIAL_BUTTON_ID}`,
      content: "Let's return to the home page.",
      disableBeacon: true,
    },
  ],
  async onJoyrideCallback({ data, router, joyrideState }) {
    const { action, index, type } = data;

    // After the 2nd (last) step, redirect to the home page tutorial
    if (
      action === JOYRIDE_ACTIONS.NEXT &&
      type === "step:after" &&
      index === 1
    ) {
      await router.push({
        pathname: "/",
        query: {
          tutorial: tutorialsRegistry.homePageTutorial.id,
          step: 3,
        },
      });
    }
  },
};

import { ACTIONS as JOYRIDE_ACTIONS } from "react-joyride";
import { TUTORIAL_BUTTON_ID } from "../TwobttnsTutorials";
import { TwobttnsTutorial } from "./tutorial";
import { tutorialsRegistry } from "./tutorialsRegistry";

export const gamesPageTutorialFromHome: TwobttnsTutorial = {
  id: "gamesPageTutorialFromHome",
  steps: [
    {
      target: `#${TUTORIAL_BUTTON_ID}`,
      content: "This is the Games management page.",
      disableBeacon: true,
    },
    {
      target: `#${TUTORIAL_BUTTON_ID}`,
      content: "Let's return to the home page.",
      disableBeacon: true,
    },
  ],
  async onJoyrideCallback({ data, router }) {
    const { action, index, status, type } = data;
    // After index 0, let's redirect back to the home page tutorial that we came from
    console.log(action);
    if (
      action === JOYRIDE_ACTIONS.NEXT &&
      type === "step:after" &&
      index === 1
    ) {
      await router.push({
        pathname: "/",
        query: {
          tutorial: tutorialsRegistry.homePageTutorial.id,
          step: 2,
        },
      });
    }
  },
};

import { Text } from "@chakra-ui/react";
import { TUTORIAL_IDS as HOME_PAGE_TUTORIAL_IDS } from "../../../../pages";
import { TUTORIAL_BUTTON_ID } from "../TwobttnsTutorials";
import { TwobttnsTutorial } from "./tutorial";

export const homePageTutorial: TwobttnsTutorial = {
  steps: [
    {
      target: `#${TUTORIAL_BUTTON_ID}`,
      content:
        "Welcome to your 2bttns admin console! This is a quick tutorial to help you get started.",
      disableBeacon: true,
    },
    {
      target: `#${HOME_PAGE_TUTORIAL_IDS.manageGamesCard}`,
      styles: {
        options: {
          width: "600px",
        },
      },
      content: (
        <>
          <Text>Click here to navigate to the Games management page.</Text>
          <br />
          <Text>
            &quot;Games&quot; are interactive user interfaces you can create and
            customize through this admin console. From the app you want to
            integrate 2bttns with, you can send end users (&quot;Players&quot;)
            to play these games, helping them build personalized content feeds
            and make decisions based on their interactions.
          </Text>
        </>
      ),
      disableBeacon: true,
    },
    {
      target: `#games-table`,
      styles: {
        options: {
          width: "600px",
        },
      },
      content: (
        <>
          <Text>FOO</Text>
        </>
      ),
      disableBeacon: true,
    },
    {
      target: `#${HOME_PAGE_TUTORIAL_IDS.manageTagsCard}`,
      styles: {
        options: {
          width: "600px",
        },
      },
      content: (
        <>
          <Text>Click here to navigate to the Tags management page.</Text>
          <br />
          <Text>
            &quot;Tags&quot; are used to organize your &quot;Game Objects.&quot;
            In order for Players to see these Game Objects when they play, you
            can assign Tags to an &quot;Input Tags&quot; field in your
            individual Games&apos; config pages.
          </Text>
        </>
      ),
      disableBeacon: true,
    },
    {
      target: `#${HOME_PAGE_TUTORIAL_IDS.manageGameObjectsCard}`,
      styles: {
        options: {
          width: "600px",
        },
      },
      content: (
        <>
          <Text>
            Click here to navigate to the Games Objects management page.
          </Text>
          <br />
          <Text>
            &quot;Game Objects&quot; are the items that Players will interact
            with in your Games. You can group Game Objects using one or more
            Tag(s).
          </Text>
        </>
      ),
      disableBeacon: true,
    },
    {
      target: `#${HOME_PAGE_TUTORIAL_IDS.manageAPIKeysCard}`,
      content: (
        <>
          <Text>
            Click here to navigate to the Settings page, which includes App/API
            Key management for integrating your app with 2bttns.
          </Text>
        </>
      ),
      disableBeacon: true,
    },
    {
      target: `#${HOME_PAGE_TUTORIAL_IDS.documentationCard}`,
      content: (
        <>
          <Text>
            ...and finally, click here to navigate to our official
            documentation.
          </Text>
        </>
      ),
      disableBeacon: true,
    },
    {
      target: `#${TUTORIAL_BUTTON_ID}`,
      content:
        "If you see this button on any page, you can click it to view a tutorial for that page.",
      disableBeacon: true,
    },
    {
      target: "#home-tutorial-button",
      content: "That's all for now. Happy building!",
      disableBeacon: true,
    },
  ],
};

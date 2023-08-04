import {
  Box,
  IconButton,
  Stack,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { GetServerSideProps, type NextPage } from "next";
import { Session } from "next-auth";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useCallback, useState } from "react";
import {
  FaBookOpen,
  FaGamepad,
  FaKey,
  FaQuestionCircle,
  FaShapes,
  FaTags,
} from "react-icons/fa";
import ReactJoyride, {
  ACTIONS as JOYRIDE_ACTIONS,
  CallBackProps as JoyrideCallBackProps,
  EVENTS as JOYRIDE_EVENTS,
  STATUS as JOYRIDE_STATUS,
} from "react-joyride";
import PreviewLinkCard from "../features/shared/components/PreviewLinkCard";
import getSessionWithSignInRedirect from "../utils/getSessionWithSignInRedirect";
const ReactJoyrideComponent = dynamic(() => import("react-joyride"), {
  ssr: false,
});

export type HomePageProps = {
  session: Session;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, redirect } = await getSessionWithSignInRedirect(context);

  if (!session && redirect) {
    return {
      redirect,
    };
  }

  return {
    props: {
      session,
    },
  };
};

const Home: NextPage<HomePageProps> = (props) => {
  const [joyride, setJoyride] = useState<ReactJoyride["props"]>({
    run: false,
    steps: [
      {
        target: "#home-tutorial-button",
        content:
          "Welcome to your 2bttns admin console! This is a quick tutorial to help you get started.",
        disableBeacon: true,
      },
      {
        target: "#manage-games-card",
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
              &quot;Games&quot; are interactive user interfaces you can create
              and customize through this admin console. From the app you want to
              integrate 2bttns with, you can send end users
              (&quot;Players&quot;) to play these games, helping them build
              personalized content feeds and make decisions based on their
              interactions.
            </Text>
          </>
        ),
        disableBeacon: true,
      },
      {
        target: "#manage-tags-card",
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
              &quot;Tags&quot; are used to organize your &quot;Game
              Objects.&quot; In order for Players to see these Game Objects when
              they play, you can assign Tags to an &quot;Input Tags&quot; field
              in your individual Games&apos; config pages.
            </Text>
          </>
        ),
        disableBeacon: true,
      },
      {
        target: "#manage-game-objects-card",
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
        target: "#manage-api-keys-card",
        content: (
          <>
            <Text>
              Click here to navigate to the Settings page, which includes
              App/API Key management for integrating your app with 2bttns.
            </Text>
          </>
        ),
        disableBeacon: true,
      },
      {
        target: "#documentation-card",
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
        target: "#home-tutorial-button",
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
    stepIndex: 0,
  });

  const handleJoyrideCallback = useCallback((data: JoyrideCallBackProps) => {
    const { action, index, status, type } = data;

    if (
      [JOYRIDE_EVENTS.STEP_AFTER, JOYRIDE_EVENTS.TARGET_NOT_FOUND].includes(
        type as any
      )
    ) {
      // Update state to advance the tour
      setJoyride((prev) => ({
        ...prev,
        stepIndex: index + (action === JOYRIDE_ACTIONS.PREV ? -1 : 1),
      }));
    } else if (
      [JOYRIDE_STATUS.FINISHED, JOYRIDE_STATUS.SKIPPED].includes(status as any)
    ) {
      // Need to set our running state to false, so we can restart if we click start again.
      setJoyride((prev) => ({ ...prev, run: false }));
    }
  }, []);

  return (
    <>
      <Head>
        <title>2bttns</title>
        <meta name="description" content="Welcome to your 2bttns console!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box height="100%">
        <Box
          position="fixed"
          bottom="1rem"
          right="1rem"
          id="home-tutorial-button"
        >
          <Tooltip label="View tutorial for this page" placement="left">
            <IconButton
              onClick={() => {
                setJoyride((prev) => ({ ...prev, stepIndex: 0, run: true }));
              }}
              icon={<FaQuestionCircle />}
              aria-label="View tutorial for this page"
            />
          </Tooltip>
        </Box>
        <ReactJoyrideComponent
          {...joyride}
          callback={handleJoyrideCallback}
          showProgress
          continuous
          showSkipButton
          disableScrolling
          disableOverlayClose
          disableCloseOnEsc
          hideCloseButton
          styles={{
            options: {
              primaryColor: "#415DB7",
            },
          }}
        />
        <VStack
          alignItems="center"
          height="100%"
          as="main"
          overflow="scroll"
          paddingTop={{ base: "1rem", md: "5rem" }}
          paddingBottom="calc(1rem + 64px)"
        >
          <Stack spacing="1rem">
            <Box id="manage-games-card">
              <PreviewLinkCard
                title="Manage Games"
                description="Manage custom games that your users can play"
                icon={<FaGamepad />}
                link="/games"
              />
            </Box>
            <Box id="manage-tags-card">
              <PreviewLinkCard
                title="Manage Tags"
                description="Manage tags that organize your game objects"
                icon={<FaTags />}
                link="/tags"
              />
            </Box>
            <Box id="manage-game-objects-card">
              <PreviewLinkCard
                title="Manage Game Objects"
                description="Manage game objects used across custom games"
                icon={<FaShapes />}
                link="/game-objects"
              />
            </Box>
            <Box id="manage-api-keys-card">
              <PreviewLinkCard
                title="Manage API Keys"
                description="Integrate your app with 2bttns"
                icon={<FaKey />}
                link="/settings"
              />
            </Box>
            <Box id="documentation-card">
              <PreviewLinkCard
                title="Documentation"
                description="Find detailed information about 2bttns features"
                icon={<FaBookOpen />}
                link="https://docs.2bttns.com"
                external
              />
            </Box>
          </Stack>
        </VStack>
      </Box>
    </>
  );
};

export default Home;

import { Box, IconButton, Stack, Tooltip, VStack } from "@chakra-ui/react";
import { GetServerSideProps, type NextPage } from "next";
import { Session } from "next-auth";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useState } from "react";
import {
  FaBookOpen,
  FaGamepad,
  FaKey,
  FaQuestionCircle,
  FaShapes,
  FaTags,
} from "react-icons/fa";
import type ReactJoyride from "react-joyride";
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
  const [steps, setSteps] = useState<ReactJoyride["props"]>({
    steps: [
      {
        target: "#manage-games-card",
        content: "This is my awesome feature!",
        disableBeacon: true,
      },
      {
        target: "#manage-game-objects-card",
        content: "This another awesome feature!",
        disableBeacon: true,
      },
    ],
    run: false,
    debug: true,
    showProgress: true,
    continuous: true,
    showSkipButton: true,
  });

  return (
    <>
      <Head>
        <title>2bttns</title>
        <meta name="description" content="Welcome to your 2bttns console!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box height="100%">
        <Box position="fixed" bottom="1rem" right="1rem">
          <Tooltip label="View tutorial for this page" placement="left">
            <IconButton
              onClick={() => {
                setSteps({ ...steps, run: true });
              }}
              icon={<FaQuestionCircle />}
              aria-label="View tutorial for this page"
            />
          </Tooltip>
        </Box>
        <ReactJoyrideComponent {...steps} />
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
            <Box id="manage-game-objects-card">
              <PreviewLinkCard
                title="Manage Game Objects"
                description="Manage game objects used across custom games"
                icon={<FaShapes />}
                link="/game-objects"
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

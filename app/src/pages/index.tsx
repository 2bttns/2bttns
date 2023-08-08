import { Box, Stack, VStack } from "@chakra-ui/react";
import { GetServerSideProps, type NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { FaBookOpen, FaGamepad, FaKey, FaShapes, FaTags } from "react-icons/fa";
import PreviewLinkCard from "../features/shared/components/PreviewLinkCard";
import { useTwoBttnsTutorialsContext } from "../features/tutorials/TwobttnsTutorialsContextProvider";
import { TwobttnsTutorial } from "../features/tutorials/views/steps/tutorial";
import getSessionWithSignInRedirect from "../utils/getSessionWithSignInRedirect";

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

export const TUTORIAL_IDS = {
  manageGamesCard: "manage-games-card",
  manageTagsCard: "manage-tags-card",
  manageGameObjectsCard: "manage-game-objects-card",
  manageAPIKeysCard: "manage-api-keys-card",
  documentationCard: "documentation-card",
};

const Home: NextPage<HomePageProps> = (props) => {
  const tutorialContext = useTwoBttnsTutorialsContext();
  const [homePageTutorial, setHomePageTutorial] =
    useState<TwobttnsTutorial | null>(null);
  useEffect(() => {
    import("../features/tutorials/views/steps/tutorialsRegistry")
      .then((mod) => {
        setHomePageTutorial(mod.tutorialsRegistry.homePageTutorial);
      })
      .catch(console.error);
  }, []);
  useEffect(() => {
    tutorialContext.setTutorial(homePageTutorial);
    return () => {
      if (tutorialContext.tutorial === homePageTutorial) {
        tutorialContext.clearTutorial();
      }
    };
  }, [tutorialContext, homePageTutorial]);

  const isTutorialActive = useMemo(() => {
    return (
      tutorialContext.currentJoyrideState?.run &&
      tutorialContext.tutorial === homePageTutorial
    );
  }, [tutorialContext, homePageTutorial]);

  return (
    <>
      <Head>
        <title>2bttns</title>
        <meta name="description" content="Welcome to your 2bttns console!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box height="100%">
        <VStack
          alignItems="center"
          height="100%"
          as="main"
          overflow="scroll"
          paddingTop={{ base: "1rem", md: "5rem" }}
          paddingBottom="calc(1rem + 64px)"
        >
          <Stack spacing="1rem">
            <Box id={TUTORIAL_IDS.manageGamesCard}>
              <PreviewLinkCard
                title="Manage Games"
                description="Manage custom games that your users can play"
                icon={<FaGamepad />}
                link={isTutorialActive ? "/games?tutorial=true" : "/games"}
              />
            </Box>
            <Box id={TUTORIAL_IDS.manageTagsCard}>
              <PreviewLinkCard
                title="Manage Tags"
                description="Manage tags that organize your game objects"
                icon={<FaTags />}
                link={isTutorialActive ? "/tags?tutorial=true" : "/tags"}
              />
            </Box>
            <Box id={TUTORIAL_IDS.manageGameObjectsCard}>
              <PreviewLinkCard
                title="Manage Game Objects"
                description="Manage game objects used across custom games"
                icon={<FaShapes />}
                link={
                  isTutorialActive
                    ? "/game-objects?tutorial=true"
                    : "/game-objects"
                }
              />
            </Box>
            <Box id={TUTORIAL_IDS.manageAPIKeysCard}>
              <PreviewLinkCard
                title="Manage API Keys"
                description="Integrate your app with 2bttns"
                icon={<FaKey />}
                link={
                  isTutorialActive ? "/settings?tutorial=true" : "/settings"
                }
              />
            </Box>
            <Box id={TUTORIAL_IDS.documentationCard}>
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

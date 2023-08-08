import { Box, Stack, VStack } from "@chakra-ui/react";
import { GetServerSideProps, type NextPage } from "next";
import { Session } from "next-auth";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect } from "react";
import { FaBookOpen, FaGamepad, FaKey, FaShapes, FaTags } from "react-icons/fa";
import PreviewLinkCard from "../features/shared/components/PreviewLinkCard";
import { useTwoBttnsTutorialsContext } from "../features/tutorials/TwobttnsTutorialsContextProvider";
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

export const TUTORIAL_IDS = {
  manageGamesCard: "manage-games-card",
  manageTagsCard: "manage-tags-card",
  manageGameObjectsCard: "manage-game-objects-card",
  manageAPIKeysCard: "manage-api-keys-card",
  documentationCard: "documentation-card",
};

const Home: NextPage<HomePageProps> = (props) => {
  const tutorialContext = useTwoBttnsTutorialsContext();
  useEffect(() => {
    import("../features/tutorials/views/steps/homePageTutorial")
      .then(({ homePageTutorial }) => {
        tutorialContext.setTutorial(homePageTutorial);
      })
      .catch(console.error);

    return () => {
      tutorialContext.clearTutorial();
    };
  }, []);

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
                link="/games"
              />
            </Box>
            <Box id={TUTORIAL_IDS.manageTagsCard}>
              <PreviewLinkCard
                title="Manage Tags"
                description="Manage tags that organize your game objects"
                icon={<FaTags />}
                link="/tags"
              />
            </Box>
            <Box id={TUTORIAL_IDS.manageGameObjectsCard}>
              <PreviewLinkCard
                title="Manage Game Objects"
                description="Manage game objects used across custom games"
                icon={<FaShapes />}
                link="/game-objects"
              />
            </Box>
            <Box id={TUTORIAL_IDS.manageAPIKeysCard}>
              <PreviewLinkCard
                title="Manage API Keys"
                description="Integrate your app with 2bttns"
                icon={<FaKey />}
                link="/settings"
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

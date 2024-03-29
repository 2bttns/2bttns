import { Box, Stack, VStack } from "@chakra-ui/react";
import { GetServerSideProps, type NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { FaBookOpen, FaGamepad, FaKey, FaShapes, FaTags } from "react-icons/fa";
import PreviewLinkCard from "../features/shared/components/PreviewLinkCard";
import { useTwoBttnsTutorialsContext } from "../features/tutorials/TwobttnsTutorialsContextProvider";
import { tutorialsRegistry } from "../features/tutorials/views/steps/tutorialsRegistry";
import getSessionWithSignInRedirect from "../utils/getSessionWithSignInRedirect";

const localStorageKeyHasSeenInitialTutorial = "hasSeenInitialTutorial";

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
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Add the home page tutorial ID to the URL query parameters if it is not already there
    // This makes the tutorial button available here on the home page
    const searchParamsDict = Object.fromEntries(searchParams.entries());
    if (searchParamsDict.tutorial === tutorialsRegistry.homePageTutorial.id) {
      return;
    }
    searchParamsDict.tutorial = tutorialsRegistry.homePageTutorial.id;

    void router.replace({
      query: searchParamsDict,
    });
  }, [searchParams]);

  useEffect(() => {
    // Automatically show the home page tutorial if the user has not seen it before
    if (typeof window === "undefined") return;
    const searchParamsDict = Object.fromEntries(searchParams.entries());
    const hasSeenInitialTutorial =
      window.localStorage.getItem(localStorageKeyHasSeenInitialTutorial) ===
      "true";
    const isTutorialActive =
      searchParamsDict.tutorial === tutorialsRegistry.homePageTutorial.id;
    if (!isTutorialActive) return;
    if (hasSeenInitialTutorial) return;

    searchParamsDict.step = "1";
    void router.replace({
      query: searchParamsDict,
    });
    window.localStorage.setItem(localStorageKeyHasSeenInitialTutorial, "true");
  }, [searchParams]);

  const isTutorialActive = useMemo(() => {
    return (
      tutorialContext.currentJoyrideState?.run &&
      tutorialContext.tutorialId === tutorialsRegistry.homePageTutorial.id
    );
  }, [tutorialContext]);

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
                link={
                  isTutorialActive
                    ? `/games?tutorial=${tutorialsRegistry.gamesPageTutorialFromHome.id}&step=1`
                    : "/games"
                }
              />
            </Box>
            <Box id={TUTORIAL_IDS.manageTagsCard}>
              <PreviewLinkCard
                title="Manage Tags"
                description="Manage tags that organize your game objects"
                icon={<FaTags />}
                link={
                  isTutorialActive
                    ? `/tags?tutorial=${tutorialsRegistry.tagsPageTutorialFromHome.id}&step=1`
                    : "/tags"
                }
              />
            </Box>
            <Box id={TUTORIAL_IDS.manageGameObjectsCard}>
              <PreviewLinkCard
                title="Manage Game Objects"
                description="Manage game objects used across custom games"
                icon={<FaShapes />}
                link={
                  isTutorialActive
                    ? `/game-objects?tutorial=${tutorialsRegistry.gameObjectsPageTutorialFromHome.id}&step=1`
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
                  isTutorialActive
                    ? `/settings?tutorial=${tutorialsRegistry.apiKeyPageTutorialFromHome.id}&step=1`
                    : "/settings"
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

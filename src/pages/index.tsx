import { Box, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { GetServerSideProps, type NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import {
  FaBookOpen,
  FaExternalLinkAlt,
  FaGamepad,
  FaKey,
  FaShapes,
  FaTags,
} from "react-icons/fa";
import PreviewLinkCard from "../features/shared/components/PreviewLinkCard";
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

const Home: NextPage<HomePageProps> = (props) => {
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
            <PreviewLinkCard
              title="Manage Games"
              description="Manage custom games that your users can play"
              icon={<FaGamepad />}
              link="/games"
            />
            <PreviewLinkCard
              title="Manage Game Objects"
              description="Manage game objects used across custom games"
              icon={<FaShapes />}
              link="/game-objects"
            />
            <PreviewLinkCard
              title="Manage Tags"
              description="Manage tags that organize your game objects"
              icon={<FaTags />}
              link="/tags"
            />
            <PreviewLinkCard
              title="Manage API Keys"
              description="Integrate your app with 2bttns"
              icon={<FaKey />}
              link="/settings"
            />
            <PreviewLinkCard
              title={
                <HStack alignItems="center">
                  <Text>Documentation</Text>
                  <FaExternalLinkAlt display="inline" fontSize="16px" />
                </HStack>
              }
              description="Find detailed information about 2bttns features"
              icon={<FaBookOpen />}
              link="https://docs.2bttns.com"
            />
          </Stack>
        </VStack>
      </Box>
    </>
  );
};

export default Home;

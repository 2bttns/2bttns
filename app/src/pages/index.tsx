import { Heading, Text, VStack } from "@chakra-ui/react";
import { type NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>2bttns</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <VStack alignItems="center" width="100%" height="100%" as="main">
        <Heading size="4xl">
          Your{" "}
          <Text color="blue.500" display="inline">
            2bttns
          </Text>{" "}
          App
        </Heading>
      </VStack>
    </>
  );
};

export default Home;

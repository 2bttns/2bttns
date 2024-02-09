import { Heading, VStack, Button, Text } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import AdminLayout from "../features/layouts/containers/AdminLayout";
import PlayerLayout from "../features/layouts/containers/PlayerLayout";
import { NextPageWithLayout } from "./_app";

const FourOhFourPage: NextPageWithLayout = () => {
  const session = useSession();

  return (
    <>
      <Head>
        <title>404 - Page Not Found | 2bttns</title>
        <meta name="description" content="Game management panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {session.status === "authenticated" && (
        <AdminLayout>
          <Content />
        </AdminLayout>
      )}

      {session.status === "unauthenticated" && (
        <PlayerLayout>
          <Content />
        </PlayerLayout>
      )}
    </>
  );
};

function Content() {
  return (
    <VStack alignItems="center" justifyContent="center" height="100%">
      <Heading marginTop="-5rem">Oops! Something isn&apos;t right here.</Heading>
      <Text>Close this page and try again.</Text>
    </VStack>
  );
}

export default FourOhFourPage;

FourOhFourPage.getLayout = (page) => page;

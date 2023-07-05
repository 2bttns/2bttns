import { Heading, VStack } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import AdminLayout from "../features/layouts/containers/AdminLayout";
import UserLayout from "../features/layouts/containers/UserLayout";
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
        <UserLayout>
          <Content />
        </UserLayout>
      )}
    </>
  );
};

function Content() {
  return (
    <VStack alignItems="center" justifyContent="center" height="100%">
      <Heading marginTop="-5rem">404 - Page Not Found</Heading>
    </VStack>
  );
}

export default FourOhFourPage;

FourOhFourPage.getLayout = (page) => page;

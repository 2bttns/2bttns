import { Box } from "@chakra-ui/react";
import type { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export type DocsPageProps = {
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

const Docs: NextPage<DocsPageProps> = (props) => {
  return (
    <Box height="100vh" bgColor="white">
      <Box height="100%" overflowY="scroll" paddingBottom="250px">
        <SwaggerUI url="/api/openapi.json" />
      </Box>
    </Box>
  );
};

export default Docs;

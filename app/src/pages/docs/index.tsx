import { Box } from "@chakra-ui/react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

const Home: NextPage = () => {
  return (
    <Box height="100%" overflowY="scroll" bgColor="white" paddingBottom="250px">
      <SwaggerUI url="/api/openapi.json" />
    </Box>
  );
};

export default Home;

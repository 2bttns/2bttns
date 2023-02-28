import { Box, Heading } from "@chakra-ui/react";
import { api, RouterOutputs } from "../utils/api";
import { NextPageWithLayout } from "./_app";

const GamesPage: NextPageWithLayout = (props) => {
  const getRankedQuery = api.gameObjects.getRanked.useQuery(
    {
      playerId: "clehkzn9j0000mixv1sjif9ir",
      inputTags: ["clehrvbvy000amixvw1l8himg"],
      outputTag: "clehsdbm3002amixvffx5oj1w",
    },
    {
      onSuccess: console.log,
      cacheTime: 0,
      retry: 0,
    }
  );

  const data = getRankedQuery.data as
    | RouterOutputs["gameObjects"]["getRanked"]
    | undefined;

  if (getRankedQuery.isError) {
    return <div>{getRankedQuery.error.message}</div>;
  }

  return (
    <>
      <Heading as="h1" size="2xl">
        Test Ranked Outputs
      </Heading>
      <Box height="500px" overflow="scroll">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Box>
    </>
  );
};

export default GamesPage;

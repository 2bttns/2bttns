import { Box, Heading } from "@chakra-ui/react";
import { NAVBAR_HEIGHT_PX } from "../features/navbar/views/Navbar";
import { api, RouterOutputs } from "../utils/api";
import { NextPageWithLayout } from "./_app";

const GamesPage: NextPageWithLayout = (props) => {
  const getRankedQuery = api.gameObjects.getRanked.useQuery(
    {
      inputTags: [
        "clehrvbvy000amixvw1l8himg",
        "clehv90cg002omixv003y3zwt",
        "clehsdbm3002amixvffx5oj1w",
        "clehvuc980030mixv57xlu143",
      ],
      outputTags: ["clehsdbm3002amixvffx5oj1w", "clehvuc980030mixv57xlu143"],
      playerId: "clehkzn9j0000mixv1sjif9ir",
    },
    {
      onSuccess: console.log,
    }
  );

  const data = getRankedQuery.data as
    | RouterOutputs["gameObjects"]["getRanked"]
    | undefined;

  return (
    <>
      <Heading as="h1" size="2xl">
        Test Ranked Outputs
      </Heading>
      <Box height="500px" overflow="scroll">
        {data?.rankedOutputs.map((d) => (
          <Box key={d.gameObjectId} p={4} border="1px solid black">
            <Box>{d.name}</Box>
            <Box>{d.score}</Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default GamesPage;

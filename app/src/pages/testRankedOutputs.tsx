import { Heading } from "@chakra-ui/react";
import { api } from "../utils/api";
import { NextPageWithLayout } from "./_app";

const GamesPage: NextPageWithLayout = (props) => {
  const getRankedQuery = api.gameObjects.getRanked.useQuery(
    {
      inputTags: ["clehrvbvy000amixvw1l8himg", "clehv90cg002omixv003y3zwt"],
      outputTags: ["clehsdbm3002amixvffx5oj1w"],
      playerId: "clehkzn9j0000mixv1sjif9ir",
    },
    {
      onSuccess: console.log,
    }
  );

  return (
    <>
      <Heading as="h1" size="2xl">
        Test Ranked Outputs
      </Heading>
    </>
  );
};

export default GamesPage;

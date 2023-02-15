import { ArrowForwardIcon, DeleteIcon } from "@chakra-ui/icons";
import { Heading, IconButton, Tooltip } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import GamesTable from "../features/games/components/GamesTable";
import { api, RouterInputs } from "../utils/api";

const GamesPage: NextPage = () => {
  const utils = api.useContext();

  const router = useRouter();

  const handlePlayGame = (gameId: string) => {
    router.push(`/play?game_id=${gameId}`);
  };

  const deleteGameMutation = api.games.deleteById.useMutation();
  const handleDeleteGame = async (
    body: RouterInputs["games"]["deleteById"]
  ) => {
    try {
      await deleteGameMutation.mutateAsync(body);
      await utils.games.invalidate();
    } catch (error) {
      window.alert("Error deleting game\n See console for details");
      console.error(error);
    }
  };

  return (
    <>
      <Head>
        <title>Games | 2bttns</title>
        <meta name="description" content="Game management panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Heading as="h1" size="2xl">
        Manage Games
      </Heading>

      <GamesTable
        additionalActions={(gameData) => {
          const { id } = gameData;
          return (
            <>
              <Tooltip label={`Play`} placement="top">
                <IconButton
                  colorScheme="blue"
                  onClick={() => {
                    handlePlayGame(id);
                  }}
                  icon={<ArrowForwardIcon />}
                  aria-label={`Play game with ID: ${id}`}
                  size="sm"
                  variant="outline"
                />
              </Tooltip>
              <Tooltip label={`Delete`} placement="top">
                <IconButton
                  colorScheme="red"
                  onClick={() => {
                    handleDeleteGame({ id });
                  }}
                  icon={<DeleteIcon />}
                  aria-label={`Delete game with ID: ${id}`}
                  size="sm"
                  variant="outline"
                />
              </Tooltip>
            </>
          );
        }}
      />
    </>
  );
};

export default GamesPage;

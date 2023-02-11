import { DeleteIcon } from "@chakra-ui/icons";
import { IconButton, Tooltip } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import GamesTable from "../features/games/components/GamesTable";
import { api, RouterInputs } from "../utils/api";

const GamesPage: NextPage = () => {
  const utils = api.useContext();

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
      <GamesTable
        additionalActions={(gameData) => {
          const { id } = gameData;
          return (
            <>
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

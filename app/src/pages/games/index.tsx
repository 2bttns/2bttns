import { ArrowForwardIcon, SettingsIcon } from "@chakra-ui/icons";
import { Heading, IconButton, Tooltip } from "@chakra-ui/react";
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import DeleteGameButton from "../../features/games/containers/DeleteGameButton";
import GamesTable from "../../features/games/containers/GamesTable";
import { api, RouterInputs } from "../../utils/api";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";

export type GamesPageProps = {
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

const GamesPage: NextPage<GamesPageProps> = (props) => {
  const utils = api.useContext();

  const router = useRouter();

  const handlePlayGame = (gameId: string) => {
    router.push(`/play?game_id=${gameId}`);
  };

  const handleManageGameRedirect = (gameId: string) => {
    router.push(`/games/${gameId}`);
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
                  variant="solid"
                />
              </Tooltip>
              <Tooltip label={`Manage`} placement="top">
                <IconButton
                  colorScheme="blue"
                  onClick={() => {
                    handleManageGameRedirect(id);
                  }}
                  icon={<SettingsIcon />}
                  aria-label={`Play game with ID: ${id}`}
                  size="sm"
                  variant="outline"
                />
              </Tooltip>
              <DeleteGameButton gameId={id} />
            </>
          );
        }}
      />
    </>
  );
};

export default GamesPage;

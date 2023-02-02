import { Box, Button, Divider, Heading, Stack } from "@chakra-ui/react";
import { Game } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";
import { RouterInputs } from "../../../utils/api";
import CreateGameForm from "../components/CreateGameForm";
import GamesTable, { GamesTableProps } from "../components/GamesTable";

export type GamesProps = {
  games: Game[];
  handleCreateGame: (input: RouterInputs["games"]["create"]) => Promise<void>;
  handleDeleteGame: (
    input: RouterInputs["games"]["deleteById"]
  ) => Promise<void>;
  handleUpdateGame: (
    input: RouterInputs["games"]["updateGameById"]
  ) => Promise<void>;
};

export default function Games(props: GamesProps) {
  const { games, handleCreateGame, handleDeleteGame, handleUpdateGame } = props;

  const handleFieldEdited: GamesTableProps["onFieldEdited"] = async (
    field,
    newValue,
    game
  ) => {
    await handleUpdateGame({
      id: game.id,
      data: {
        [field]: newValue,
      },
    });
  };

  return (
    <Box sx={{ padding: "1rem", backgroundColor: "#ddd" }}>
      <Head>
        <title>My Games</title>
        <meta name="description" content="My 2bttns Games" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Box
          sx={{
            paddingTop: "1rem",
            backgroundColor: "#fff",
            padding: "1rem",
          }}
        >
          <Heading as="h2" size="xl">
            Create a Game
          </Heading>
          <CreateGameForm
            onSubmit={(data) => {
              handleCreateGame({
                name: data.name,
                description: data.description ?? undefined,
              });
            }}
          />
        </Box>

        <Divider orientation="horizontal" sx={{ paddingY: "1rem" }} />

        <Box sx={{ backgroundColor: "#fff", padding: "1rem" }}>
          <Heading as="h1" size="2xl">
            My Games
          </Heading>
          {games && (
            <GamesTable
              onFieldEdited={handleFieldEdited}
              games={games}
              renderActions={(game) => {
                return (
                  <Stack direction="row">
                    <Link href={`/play?game_id=${game.id}`} passHref>
                      <Button as="a" colorScheme="green">
                        Play
                      </Button>
                    </Link>
                    <Button
                      as="a"
                      colorScheme="red"
                      onClick={() => handleDeleteGame({ id: game.id })}
                    >
                      Delete
                    </Button>
                  </Stack>
                );
              }}
            />
          )}
        </Box>
      </main>
    </Box>
  );
}

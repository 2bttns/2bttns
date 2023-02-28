import { Box, Heading, Text } from "@chakra-ui/react";
import { Game } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import GameInputTagsMultiSelect from "../../features/tags/containers/GameInputTagsMultiSelect";
import { prisma } from "../../server/db";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";

export type GameByIdPageProps = {
  gameId: Game["id"];
  session: Session;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, redirect } = await getSessionWithSignInRedirect(context);
  if (!session && redirect) {
    return {
      redirect,
    };
  }

  const gameId = context.params?.id as string;
  try {
    await prisma.game.findUniqueOrThrow({
      where: {
        id: gameId,
      },
    });
  } catch (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      gameId,
      session,
    },
  };
};

const GameById: NextPage<GameByIdPageProps> = (props) => {
  const { gameId } = props;

  return (
    <>
      <Box width="100%" height="100vh" overflowY="scroll">
        <Heading>Game {gameId}</Heading>
        <Text>Configure</Text>
        <Text>Input Tags</Text>
        <Box width="256px">
          <GameInputTagsMultiSelect gameId={gameId} />
        </Box>

        <Text># Items Per Round</Text>
        <Text>Mode</Text>
        <Text>Game Objects</Text>
      </Box>
    </>
  );
};

export default GameById;

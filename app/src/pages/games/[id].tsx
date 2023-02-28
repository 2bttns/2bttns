import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  ButtonGroup,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Game } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import DeleteGameButton from "../../features/games/containers/DeleteGameButton";
import PlayGameButton from "../../features/games/containers/PlayGameButton";
import CustomEditable from "../../features/shared/components/CustomEditable";
import GameInputTagsMultiSelect from "../../features/tags/containers/GameInputTagsMultiSelect";
import { prisma } from "../../server/db";
import { api, RouterInputs } from "../../utils/api";
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
        <VStack spacing="1rem" width="100%" alignItems="start">
          <GameDetails gameId={gameId} />
          <HStack>
            <Text fontWeight="bold">Input Tags:</Text>
            <Box width="256px">
              <GameInputTagsMultiSelect gameId={gameId} />
            </Box>
          </HStack>
        </VStack>
      </Box>
    </>
  );
};

type GameDetailsProps = {
  gameId: Game["id"];
};
function GameDetails(props: GameDetailsProps) {
  const { gameId } = props;

  const utils = api.useContext();
  const gameQuery = api.games.getById.useQuery({ id: gameId });
  const updateGameMutation = api.games.updateById.useMutation();
  const handleUpdateGame = async (
    input: RouterInputs["games"]["updateById"]
  ) => {
    await updateGameMutation.mutateAsync(input);
    await utils.games.getById.invalidate({ id: input.id });
  };

  const router = useRouter();
  const onDeleted = () => {
    router.push("/games");
  };

  if (gameQuery.isLoading || !gameQuery.data) {
    return null;
  }

  if (gameQuery.isError) {
    return <Text>Error loading game data</Text>;
  }

  return (
    <Box width="100%">
      <HStack justifyContent="space-between">
        <Breadcrumb
          spacing="4px"
          separator={<ChevronRightIcon color="gray.500" />}
          marginBottom="1rem"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/games">Games</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href={`/games/${gameId}`}>
              {gameQuery.data.game.name || "Untitled Game"}
              <Text color="blue.500" display="inline">
                {" "}
                ({gameId})
              </Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <ButtonGroup>
          <PlayGameButton gameId={gameId} />
          <DeleteGameButton gameId={gameId} onDeleted={onDeleted} />
        </ButtonGroup>
      </HStack>

      <Heading size="xl">
        <CustomEditable
          value={gameQuery.data.game.name ?? ""}
          placeholder="Untitled Game"
          handleSave={async (value) => {
            handleUpdateGame({
              id: gameId,
              data: { name: value },
            });
          }}
        />
      </Heading>
      <CustomEditable
        isTextarea
        value={gameQuery.data.game.description ?? ""}
        placeholder="No description"
        handleSave={async (value) => {
          handleUpdateGame({
            id: gameId,
            data: { description: value },
          });
        }}
      />

      <Text>Configure</Text>
      <HStack>
        <Text fontWeight="bold"># Items Per Round:</Text>
        <CustomEditable
          value={gameQuery.data.game.defaultNumItemsPerRound?.toString() ?? ""}
          placeholder="ALL"
          handleSave={async (nextValue) => {
            await handleUpdateGame({
              id: gameId,
              data: {
                defaultNumItemsPerRound:
                  nextValue === "" ? undefined : parseInt(nextValue),
              },
            });
          }}
        />
      </HStack>
      {/* <Text>Mode</Text> */}
      {/* <Text>Game Objects</Text> */}
    </Box>
  );
}

export default GameById;

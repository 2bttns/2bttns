import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  ButtonGroup,
  Heading,
  HStack,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Game, Tag } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DeleteGameButton from "../../features/games/containers/DeleteGameButton";
import EditGameMode from "../../features/games/containers/EditGameMode";
import PlayGameButton from "../../features/games/containers/PlayGameButton";
import CustomEditable from "../../features/shared/components/CustomEditable";
import TagMultiSelect, {
  TagMultiSelectProps,
} from "../../features/tags/containers/TagMultiSelect";
import { prisma } from "../../server/db";
import { api, RouterInputs } from "../../utils/api";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";
import wait from "../../utils/wait";

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
      <Box width="100%" height="100%" padding="1rem">
        <VStack spacing="1rem" width="100%" alignItems="start">
          <GameDetails gameId={gameId} />
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

  const toast = useToast();
  const router = useRouter();

  const utils = api.useContext();
  const gameQuery = api.games.getById.useQuery({ id: gameId });
  const updateGameMutation = api.games.updateById.useMutation();
  const handleUpdateGame = async (
    input: RouterInputs["games"]["updateById"]
  ) => {
    let updateDescription = `Saving changes...`;
    let updateToast = toast({
      title: "Updating Game",
      status: "loading",
      description: updateDescription,
    });
    try {
      await updateGameMutation.mutateAsync(input);

      // Redirect to the new game ID page if the ID changed
      const id = input.data.id;
      if (id && id !== gameId) {
        toast.close(updateToast);
        updateDescription = `Redirecting to new game ID page (${id})...`;
        updateToast = toast({
          title: "ID Changed",
          status: "loading",
          description: updateDescription,
        });
        await wait(1);
        await router.push(`/games/${id}`);
        await utils.games.getById.invalidate({ id: input.id });
      }

      updateDescription = ``;
      toast.update(updateToast, {
        title: "Saved",
        status: "success",
        description: updateDescription,
      });
    } catch (error) {
      updateDescription = `Failed to update (Game ID=${gameId}). See console for details`;
      toast.update(updateToast, {
        title: "Error",
        status: "error",
        description: updateDescription,
      });

      // This will be caught by CustomEditable component using this function
      // it will revert the value to the previous value when it receives an error
      console.error(error);
      throw error;
    }
  };

  const onDeleted = () => {
    router.push("/games");
  };

  const [inputTags, setInputTags] = useState<
    TagMultiSelectProps["value"] | null
  >(null);

  useEffect(() => {
    if (!gameQuery.data) return;
    const data = gameQuery.data.game.inputTags.map((t) => ({
      value: t.id,
      label: t.name,
    }));
    setInputTags(data);
  }, [gameQuery.data]);

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

      <Box width="100%" height="100%" overflow="auto">
        <Box minW="2xl" maxW="2xl">
          <TableContainer overflowX="visible" overflowY="visible">
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>
                    <Heading size="md">Game Setup</Heading>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>ID</Td>
                  <Td>
                    <CustomEditable
                      value={gameQuery.data.game.id ?? ""}
                      placeholder="<Missing ID>"
                      handleSave={async (value) => {
                        await handleUpdateGame({
                          id: gameId,
                          data: { id: value },
                        });
                      }}
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td>Name</Td>
                  <Td>
                    <CustomEditable
                      value={gameQuery.data.game.name ?? ""}
                      placeholder="<Untitled Game>"
                      handleSave={async (value) => {
                        await handleUpdateGame({
                          id: gameId,
                          data: { name: value },
                        });
                      }}
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td verticalAlign="top">Description</Td>
                  <Td verticalAlign="top">
                    <CustomEditable
                      isTextarea
                      value={gameQuery.data.game.description ?? ""}
                      placeholder="<No Description>"
                      handleSave={async (value) => {
                        await handleUpdateGame({
                          id: gameId,
                          data: { description: value },
                        });
                      }}
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td>Input Tags</Td>
                  <Td>
                    {!inputTags && <Skeleton height="24px" width="100%" />}
                    {inputTags && (
                      <TagMultiSelect
                        value={inputTags}
                        onChange={async (nextValue) => {
                          setInputTags(nextValue);
                          await handleUpdateGame({
                            id: gameId,
                            data: {
                              inputTags: nextValue.map(
                                (t) => t.value as Tag["id"]
                              ),
                            },
                          });
                        }}
                      />
                    )}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
          <Box sx={{ marginY: "1rem" }}>
            <EditGameMode gameId={gameId} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default GameById;

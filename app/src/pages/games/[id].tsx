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
import { CustomCssEditorDrawer } from "../../features/games/containers/CustomCssEditor/CustomCssEditorDrawer";
import DeleteGameButton from "../../features/games/containers/DeleteGameButton";
import EditGameMode from "../../features/games/containers/EditGameMode";
import TestPlayGameButton from "../../features/games/containers/TestPlayGameButton";
import useGetGameObjectsAssociatedWithGame from "../../features/games/hooks/useGetGameObjectsAssociatedWithGame";
import CustomEditable from "../../features/shared/components/CustomEditable";
import UnderlinedTextTooltip from "../../features/shared/components/UnderlinedTextTooltip";
import { EditTagsForGameButtonDrawer } from "../../features/tags/containers/EditTagsForGameButtonDrawer";
import TagBadges from "../../features/tags/containers/TagBadges";
import { TagMultiSelectProps } from "../../features/tags/containers/TagMultiSelect";
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
        updateDescription = `Redirecting to new Game ID page (${id})...`;
        updateToast = toast({
          title: "ID Changed",
          status: "loading",
          description: updateDescription,
        });
        await wait(1);
        await router.replace(`/games/${id}`);
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
    } finally {
      try {
        await utils.games.getById.invalidate({ id: input.id });
      } catch (error) {
        console.error("Failed to invalidate game cache");
        console.error(error);
      }
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

  const gameObjectsAssocatedWithGame = useGetGameObjectsAssociatedWithGame({
    gameId,
  });

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
          <TestPlayGameButton gameId={gameId} view="admin" />
          <TestPlayGameButton gameId={gameId} view="player" />
          <DeleteGameButton gameId={gameId} onDeleted={onDeleted} />
        </ButtonGroup>
      </HStack>

      <Box
        width="100%"
        maxHeight="calc(100vh - 120px)"
        overflowX="auto"
        overflowY="scroll"
      >
        <Box minW="2xl" maxW="2xl" paddingBottom="5rem">
          <TableContainer overflowX="visible" overflowY="visible">
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>
                    <Heading size="md">Game Details</Heading>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>
                    <UnderlinedTextTooltip
                      tooltipProps={{
                        label: (
                          <VStack
                            spacing={1}
                            alignItems="start"
                            fontSize="12px"
                            padding="1rem"
                          >
                            <Text fontWeight="bold">ID</Text>
                            <Text>
                              A default ID is generated for you when a Game is
                              created.
                            </Text>
                            <Text>
                              An ID may only contain alphanumeric, underscore
                              (_), and hyphen (-) characters.
                            </Text>
                            <Text
                              color="yellow.500"
                              fontStyle="bold"
                              textDecoration="underline"
                            >
                              ⚠️ Warning: Changing the ID will change the URL of
                              the Game. This may break external connections to
                              your Game.
                            </Text>
                          </VStack>
                        ),
                      }}
                    >
                      ID
                    </UnderlinedTextTooltip>
                  </Td>
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
                  <Td>
                    <UnderlinedTextTooltip
                      tooltipProps={{
                        label: (
                          <VStack
                            spacing={1}
                            alignItems="start"
                            fontSize="12px"
                            padding="1rem"
                          >
                            <Text fontWeight="bold">NAME</Text>
                            <Text>Optional display name of the Game.</Text>
                          </VStack>
                        ),
                      }}
                    >
                      Name
                    </UnderlinedTextTooltip>
                  </Td>
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
                  <Td verticalAlign="top">
                    <UnderlinedTextTooltip
                      tooltipProps={{
                        label: (
                          <VStack
                            spacing={1}
                            alignItems="start"
                            fontSize="12px"
                            padding="1rem"
                          >
                            <Text fontWeight="bold">DESCRIPTION</Text>
                            <Text>Optional text description of the Game.</Text>
                          </VStack>
                        ),
                      }}
                    >
                      Description
                    </UnderlinedTextTooltip>
                  </Td>
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
                  <Td>
                    <UnderlinedTextTooltip
                      tooltipProps={{
                        label: (
                          <VStack
                            spacing={1}
                            alignItems="start"
                            fontSize="12px"
                            padding="1rem"
                          >
                            <Text fontWeight="bold">INPUT TAGS</Text>
                            <Text>
                              Choose the tag(s) corresponding to the collection
                              of Game Objects that players should see when they
                              play the Game.
                            </Text>
                          </VStack>
                        ),
                      }}
                    >
                      Input Tags
                    </UnderlinedTextTooltip>
                  </Td>
                  <Td>
                    <HStack justifyContent="space-between">
                      {!inputTags && <Skeleton height="24px" width="100%" />}
                      {inputTags && (
                        <>
                          <Box width="340px" alignItems="start">
                            {inputTags.length > 0 && (
                              <TagBadges
                                selectedTags={inputTags.map((v) => {
                                  return {
                                    id: v.value as Tag["id"],
                                    name: v.label,
                                  };
                                })}
                              />
                            )}
                            {inputTags.length === 0 && (
                              <Text
                                color="gray.500"
                                fontStyle="italic"
                                alignSelf="center"
                              >
                                &lt;No tags selected&gt;
                              </Text>
                            )}
                          </Box>
                          <EditTagsForGameButtonDrawer gameId={gameId} />
                        </>
                      )}
                    </HStack>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <UnderlinedTextTooltip
                      tooltipProps={{
                        label: (
                          <VStack
                            spacing={1}
                            alignItems="start"
                            fontSize="12px"
                            padding="1rem"
                          >
                            <Text fontWeight="bold"># OF GAME OBJECTS</Text>
                            <Text>
                              The number of Game Objects associated with this
                              game, based on the Input Tags associated with this
                              Game.
                            </Text>
                          </VStack>
                        ),
                      }}
                    >
                      # of Game Objects
                    </UnderlinedTextTooltip>
                  </Td>
                  <Td>
                    <HStack justifyContent="space-between">
                      {gameObjectsAssocatedWithGame === null && (
                        <Skeleton height="24px" width="100%" />
                      )}
                      {gameObjectsAssocatedWithGame !== null && (
                        <>{gameObjectsAssocatedWithGame.length}</>
                      )}
                    </HStack>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <UnderlinedTextTooltip
                      tooltipProps={{
                        label: (
                          <VStack
                            spacing={1}
                            alignItems="start"
                            fontSize="12px"
                            padding="1rem"
                          >
                            <Text fontWeight="bold">CUSTOM CSS</Text>
                            <Text>
                              Custom CSS stylesheet for overriding the Game UI
                              elements. Different modes will expose different
                              classes you can use to override their styles.
                            </Text>
                          </VStack>
                        ),
                      }}
                    >
                      Custom CSS
                    </UnderlinedTextTooltip>
                  </Td>
                  <Td>
                    <HStack justifyContent="end">
                      <CustomCssEditorDrawer
                        gameId={gameId}
                        gameName={gameQuery.data.game.name}
                        onSave={async (toSave) => {
                          console.log("toSave", toSave);
                        }}
                      />
                    </HStack>
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

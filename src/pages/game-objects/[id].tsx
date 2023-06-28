import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  ButtonGroup,
  Divider,
  Heading,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { GameObject } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import DeleteGameObjectButton from "../../features/gameobjects/containers/DeleteGameObjectButton";
import GameObjectsTable, {
  GameObjectData,
} from "../../features/gameobjects/containers/GameObjectsTable";
import ManageGameObjectButton from "../../features/gameobjects/containers/ManageGameObjectButton";
import RelateGameObjects from "../../features/gameobjects/containers/RelateGameObjects";
import useDeleteGameObjects from "../../features/gameobjects/hooks/useDeleteGameObjects";
import CustomEditable from "../../features/shared/components/CustomEditable";
import { AdditionalColumns } from "../../features/shared/components/Table/containers/PaginatedTable";
import TableActionMenu from "../../features/shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemDelete from "../../features/shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemDelete";
import UnderlinedTextTooltip from "../../features/shared/components/UnderlinedTextTooltip";
import { EditTagsForGameObjectsButtonDrawer } from "../../features/tags/containers/EditTagsForGameObjectsButtonDrawer";
import { SelectTagFiltersDrawerButton } from "../../features/tags/containers/SelectTagFiltersDrawerButton";
import TagBadges from "../../features/tags/containers/TagBadges";
import useAllTagFilters from "../../features/tags/hooks/useAllTagFilters";
import { prisma } from "../../server/db";
import { api, RouterInputs } from "../../utils/api";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";

export type GameObjectByIdPageProps = {
  gameObjectId: GameObject["id"];
  session: Session;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, redirect } = await getSessionWithSignInRedirect(context);
  if (!session && redirect) {
    return {
      redirect,
    };
  }

  const gameObjectId = context.params?.id as string;
  try {
    await prisma.gameObject.findUniqueOrThrow({
      where: {
        id: gameObjectId,
      },
    });
  } catch (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      gameObjectId,
      session,
    },
  };
};

const GameObjectById: NextPage<GameObjectByIdPageProps> = (props) => {
  const { gameObjectId } = props;

  const tagFilter = useAllTagFilters();
  const router = useRouter();

  return (
    <>
      <Box width="100%" height="100%" padding="1rem" overflow="auto">
        <Box>
          <GameObjectDetails gameObjectId={gameObjectId} />
          <Divider />
        </Box>

        <GameObjectsTable
          allowCreate={false}
          gameObjectsToExclude={[gameObjectId]}
          tag={{
            include: tagFilter.results.includeTags,
            exclude: tagFilter.results.excludeTags,
            untaggedFilter: tagFilter.results.untaggedFilter,
          }}
          additionalColumns={getAdditionalColumns(gameObjectId)}
          // TODO: Fix table fitting -- maybe delay rendering until after the game object details have rendered?
          constrainToRemainingSpaceProps={{
            bottomOffset: 120,
          }}
          additionalTopBarContent={(selectedRows) => (
            <AdditionalTopBarContent
              selectedRows={selectedRows}
              tagFilter={tagFilter}
            />
          )}
          editable={false}
          onRowDoubleClicked={async (row) => {
            await router.push(`/game-objects/${row.id}`);
          }}
        />
      </Box>
    </>
  );
};

type AdditionalTopBarContentProps = {
  selectedRows: GameObjectData[];
  tagFilter: ReturnType<typeof useAllTagFilters>;
};
function AdditionalTopBarContent(props: AdditionalTopBarContentProps) {
  const { selectedRows, tagFilter } = props;

  const { handleDeleteGameObjects } = useDeleteGameObjects();
  return (
    <ButtonGroup>
      <TableActionMenu
        selectedRows={selectedRows}
        actionItems={(context) => (
          <>
            <TableActionsMenuItemDelete
              context={context}
              handleDelete={async (selectedRows) => {
                await handleDeleteGameObjects(
                  selectedRows.map((row) => row.id)
                );
              }}
              closeMenuMode="on-confirm"
            />
          </>
        )}
      />
      <SelectTagFiltersDrawerButton
        tagFilter={tagFilter.state.tagFilter}
        setTagFilter={tagFilter.state.setTagFilter}
      />
    </ButtonGroup>
  );
}

function getAdditionalColumns(
  gameObjectId: GameObject["id"]
): AdditionalColumns<GameObjectData> {
  return {
    columns: [
      {
        name: "Relationship Weight",
        cell: ({ id }) => {
          return (
            <RelateGameObjects
              gameObjectId1={gameObjectId}
              gameObjectId2={id}
            />
          );
        },
        minWidth: "500px",
      },
      {
        cell: ({ id }) => {
          return (
            <ButtonGroup width="100%" justifyContent="end">
              <EditTagsForGameObjectsButtonDrawer gameObjectIds={[id]} />
              <ManageGameObjectButton gameObjectId={id} />
            </ButtonGroup>
          );
        },
      },
    ],

    // Re-render the table the game objects table when these change
    // Without this, relationship weights might not update correctly when navigating to another game object's page
    dependencies: [gameObjectId],
  };
}

type GameObjectDetailsProps = {
  gameObjectId: string;
};

function GameObjectDetails(props: GameObjectDetailsProps) {
  const { gameObjectId } = props;
  const gameObjectQuery = api.gameObjects.getById.useQuery({
    id: gameObjectId,
    includeTags: true,
  });
  const gameObject = gameObjectQuery.data?.gameObject;
  const name = gameObject?.name ?? "Untitled Game Object";

  const utils = api.useContext();
  const updateGameObjectMutation = api.gameObjects.updateById.useMutation();
  const handleUpdateGameObject = async (
    input: RouterInputs["gameObjects"]["updateById"]
  ) => {
    try {
      await updateGameObjectMutation.mutateAsync(input);
      await utils.gameObjects.invalidate();
    } catch (error) {
      console.error(error);
      window.alert("Error updating game object. See console for details.");
    }
  };

  const router = useRouter();
  const onDeleted = () => {
    router.push("/game-objects");
  };

  if (!gameObject) return null;

  return (
    <Box>
      <Head>
        <title>{name} - GameObjects | 2bttns</title>
        <meta name="description" content="Manage Game Object" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HStack justifyContent="space-between">
        <Breadcrumb
          spacing="4px"
          separator={<ChevronRightIcon color="gray.500" />}
          marginBottom="1rem"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/game-objects">Game Objects</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href={`/game-objects/${gameObject.id}`}>
              {name || "Untitled Game Object"}
              <Text color="blue.500" display="inline">
                {" "}
                ({gameObject.id})
              </Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <DeleteGameObjectButton
          gameObjectId={gameObject.id}
          onDeleted={onDeleted}
        />
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
                              A default ID is generated for you when a Game
                              Object is created.
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
                              the Game Object. This may break external
                              references to the Game Object.
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
                      value={gameObject.id ?? ""}
                      placeholder="<Missing ID>"
                      handleSave={async (value) => {
                        await handleUpdateGameObject({
                          id: gameObjectId,
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
                            <Text>
                              Optional display name of the Game Object.
                            </Text>
                          </VStack>
                        ),
                      }}
                    >
                      Name
                    </UnderlinedTextTooltip>
                  </Td>
                  <Td>
                    <CustomEditable
                      value={gameObject?.name ?? ""}
                      placeholder="<Untitled Game>"
                      handleSave={async (value) => {
                        await handleUpdateGameObject({
                          id: gameObjectId,
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
                            <Text>
                              Optional text description of the Game Object.
                            </Text>
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
                      value={gameObject?.description ?? ""}
                      placeholder="<No Description>"
                      handleSave={async (value) => {
                        await handleUpdateGameObject({
                          id: gameObjectId,
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
                    {/* {!inputTags && <Skeleton height="24px" width="100%" />}
                    {inputTags && (
                      <TagMultiSelect
                        value={inputTags}
                        onChange={async (nextValue) => {
                          setInputTags(nextValue);
                          await handleUpdateGameObject({
                            id: gameObjectId
                            data: {
                              inputTags: nextValue.map(
                                (t) => t.value as Tag["id"]
                              ),
                            },
                          });
                        }}
                      />
                    )} */}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        <Box marginTop="1rem">
          <TagBadges
            selectedTags={gameObject.tags}
            collapseLetterLimit="disabled"
          />
        </Box>
      </Box>
    </Box>
  );
}

export default GameObjectById;

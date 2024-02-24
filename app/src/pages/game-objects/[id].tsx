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
  Tab,
  Table,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { GameObject, Tag } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DeleteGameObjectButton from "../../features/gameobjects/containers/DeleteGameObjectButton";
import GameObjectsTable, {
  columnIds,
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
import TagMultiSelect, {
  TagMultiSelectProps,
} from "../../features/tags/containers/TagMultiSelect";
import useAllTagFilters from "../../features/tags/hooks/useAllTagFilters";
import { prisma } from "../../server/db";
import { api, RouterInputs } from "../../utils/api";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";
import wait from "../../utils/wait";

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

  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      <Box width="100%" height="100%" padding="1rem" overflow="auto">
        <GameObjectBreadcrumb gameObjectId={gameObjectId} />

        <Tabs tabIndex={tabIndex} onChange={setTabIndex}>
          <TabList>
            <Tab>Details</Tab>
            <Tab>Relationships</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {/* Render only when tab is active */}
              {tabIndex === 0 && (
                <GameObjectDetails gameObjectId={gameObjectId} />
              )}
            </TabPanel>
            <TabPanel>
              {/* Render only when tab is active -- otherwise the table may not render properly when hidden and not appear properly when changing to its tab */}
              {tabIndex === 1 && (
                <GameObjectsTable
                  allowCreate={false}
                  gameObjectsToExclude={[gameObjectId]}
                  tag={{
                    include: tagFilter.results.includeTags,
                    exclude: tagFilter.results.excludeTags,
                    untaggedFilter: tagFilter.results.untaggedFilter,
                  }}
                  additionalColumns={getAdditionalColumns(gameObjectId)}
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
                  defaultSortFieldId={columnIds.UPDATED_AT}
                  defaultSortAsc={false}
                />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
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
  });
  const gameObject = gameObjectQuery.data?.gameObject;

  const toast = useToast();
  const router = useRouter();

  const utils = api.useContext();
  const updateGameObjectMutation = api.gameObjects.updateById.useMutation();
  const handleUpdateGameObject = async (
    input: RouterInputs["gameObjects"]["updateById"]
  ) => {
    let updateDescription = `Saving changes...`;
    let updateToast = toast({
      title: "Updating Game Object",
      status: "loading",
      description: updateDescription,
    });
    try {
      await updateGameObjectMutation.mutateAsync(input);

      // Redirect to the new game object ID page if the ID changed
      const id = input.data.id;
      if (id && id !== gameObjectId) {
        toast.close(updateToast);
        updateDescription = `Redirecting to new Game Object ID page (${id})...`;
        updateToast = toast({
          title: "ID Changed",
          status: "loading",
          description: updateDescription,
        });
        await wait(1);
        await router.replace(`/game-objects/${id}`);
      }

      updateDescription = ``;
      toast.update(updateToast, {
        title: "Saved",
        status: "success",
        description: updateDescription,
        duration: 1000,
      });
      await utils.gameObjects.getById.invalidate({ id: gameObjectId });
    } catch (error) {
      updateDescription = `Failed to update (Game Object ID=${gameObjectId}). See console for details`;
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

  const [tags, setTags] = useState<TagMultiSelectProps["value"] | null>(null);

  useEffect(() => {
    if (!gameObject) return;
    const data = gameObject.tags.map((t) => ({
      value: t.id,
      label: t.name,
    }));
    setTags(data);
  }, [gameObject]);

  if (!gameObject) return null;

  return (
    <Box>
      <Box width="100%" height="calc(100vh - 200px)">
        <Box minW="2xl" maxW="2xl" paddingBottom="5rem">
          <TableContainer overflowX="visible" overflowY="visible">
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>
                    <Heading size="md">Game Object Details</Heading>
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
                      placeholder="<Untitled Game Object>"
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
                            <Text fontWeight="bold">TAGS</Text>
                            <Text>
                              Group Game Objects together by assigning them one
                              or more Tag(s). Games take Tags as inputs to
                              determine which Game Objects to show to players.
                            </Text>
                          </VStack>
                        ),
                      }}
                    >
                      Tags
                    </UnderlinedTextTooltip>
                  </Td>
                  <Td>
                    {!tags && <Skeleton height="24px" width="100%" />}
                    {tags && (
                      <TagMultiSelect
                        value={tags}
                        onChange={async (nextValue) => {
                          setTags(nextValue);
                          await handleUpdateGameObject({
                            id: gameObjectId,
                            data: {
                              tags: nextValue.map((t) => t.value as Tag["id"]),
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
        </Box>
      </Box>
    </Box>
  );
}

type GameObjectBreadcrumbProps = {
  gameObjectId: GameObject["id"];
};

function GameObjectBreadcrumb(props: GameObjectBreadcrumbProps) {
  const { gameObjectId } = props;

  const router = useRouter();
  const onDeleted = async () => {
    await router.replace("/game-objects");
  };

  const gameObjectQuery = api.gameObjects.getById.useQuery({
    id: gameObjectId,
  });

  const name =
    gameObjectQuery?.data?.gameObject?.name || "<Untitled Game Object>";

  return (
    <>
      <Head>
        <title>{name} - GameObjects | 2bttns</title>
        <meta name="description" content="Manage Game Object" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HStack justifyContent="space-between" alignItems="center">
        {gameObjectQuery.isLoading ? (
          <Skeleton width="100%" height="40px" />
        ) : (
          <>
            <Breadcrumb
              spacing="4px"
              separator={<ChevronRightIcon color="gray.500" />}
            >
              <BreadcrumbItem>
                <BreadcrumbLink href="/game-objects">
                  Game Objects
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink href={`/game-objects/${gameObjectId}`}>
                  {name || "Untitled Game Object"}
                  <Text color="blue.500" display="inline">
                    {" "}
                    ({gameObjectId})
                  </Text>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <DeleteGameObjectButton
              gameObjectId={gameObjectId}
              onDeleted={onDeleted}
            />
          </>
        )}
      </HStack>
    </>
  );
}

export default GameObjectById;

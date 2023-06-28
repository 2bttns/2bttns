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
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import GameObjectsTable, {
  GameObjectData,
  GameObjectsTableProps,
} from "../../features/gameobjects/containers/GameObjectsTable";
import CustomEditable from "../../features/shared/components/CustomEditable";
import { AdditionalColumns } from "../../features/shared/components/Table/containers/PaginatedTable";
import TableActionMenu from "../../features/shared/components/Table/containers/TableActionsMenu";
import UnderlinedTextTooltip from "../../features/shared/components/UnderlinedTextTooltip";
import DeleteTagButton from "../../features/tags/containers/DeleteTagButton";
import ToggleTagForSelectedGameObjects from "../../features/tags/containers/TableActionsMenu/ToggleTagForSelectedGameObjects";
import ToggleTagButton from "../../features/tags/containers/ToggleTagButton";
import { api, RouterInputs } from "../../utils/api";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";
import wait from "../../utils/wait";

export type TagByIdPageProps = {
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

const TagByIdPage: NextPage<TagByIdPageProps> = (props) => {
  const router = useRouter();
  const tagId = router.query.tagId as string;
  const toast = useToast();
  const utils = api.useContext();

  const getTagByIdQuery = api.tags.getById.useQuery(
    { id: tagId },
    {
      enabled: !!tagId,
      retry: false,
      onError: async () => {
        await router.replace("/tags");
      },
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const updateTagMutation = api.tags.updateById.useMutation();
  const handleUpdateTag = async (input: RouterInputs["tags"]["updateById"]) => {
    let updateDescription = `Saving changes...`;
    let updateToast = toast({
      title: "Updating Tag",
      status: "loading",
      description: updateDescription,
    });
    try {
      await updateTagMutation.mutateAsync(input);

      // Redirect to the new tag ID page if the ID changed
      const id = input.data.id;
      if (id && id !== tagId) {
        toast.close(updateToast);
        updateDescription = `Redirecting to new Tag ID page (${id})...`;
        updateToast = toast({
          title: "ID Changed",
          status: "loading",
          description: updateDescription,
        });
        await wait(1);
        await router.replace(`/tags/${id}`);
      }

      updateDescription = ``;
      toast.update(updateToast, {
        title: "Saved",
        status: "success",
        description: updateDescription,
      });
      await utils.tags.getById.invalidate({ id: tagId });
    } catch (error) {
      updateDescription = `Failed to update (Tag ID=${tagId}). See console for details`;
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

  const handleGameObjectCreated: GameObjectsTableProps["onGameObjectCreated"] =
    async (gameObjectId) => {
      try {
        await updateTagMutation.mutateAsync({
          id: tagId,
          data: { addGameObjects: [gameObjectId] },
        });
        await utils.gameObjects.invalidate();
      } catch (error) {
        window.alert("Error creating game object. See console for details.");
        console.error(error);
      }
    };

  const tagsCountQuery = api.tags.getCount.useQuery();
  const tagsQuery = api.tags.getAll.useQuery(
    { take: tagsCountQuery.data?.count ?? 0 },
    { enabled: tagsCountQuery.data?.count !== undefined }
  );
  const allTags = useMemo(() => {
    if (!tagsQuery.data?.tags) return [];
    return tagsQuery.data.tags.map((t) => t.id);
  }, [tagsQuery.data?.tags, tagId]);

  const tag = getTagByIdQuery.data?.tag;
  if (!tag) return <></>;

  return (
    <>
      <Head>
        <title>Tags - {tag?.name} | 2bttns</title>
        <meta name="description" content="2bttns Tag Management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Stack direction="column" width="100%" spacing="1rem" padding="1rem">
        {
          <HStack justifyContent="space-between">
            <Breadcrumb
              spacing="4px"
              separator={<ChevronRightIcon color="gray.500" />}
              marginBottom="1rem"
            >
              <BreadcrumbItem>
                <BreadcrumbLink href="/tags">Tags</BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink href={`/tags/${tag.id}`}>
                  {tag.name || "Untitled Tag"}
                  <Text color="blue.500" display="inline">
                    {" "}
                    ({tag.id})
                  </Text>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <ButtonGroup>
              <DeleteTagButton tagId={tag.id} />
            </ButtonGroup>
          </HStack>
        }

        <Box minW="2xl" maxW="2xl" paddingBottom="5rem">
          <TableContainer overflowX="visible" overflowY="visible">
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>
                    <Heading size="md">Tag Details</Heading>
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
                              A default ID is generated for you when a Tag is
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
                              the Tag. This may break external references to the
                              Tag.
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
                      value={tag?.id ?? ""}
                      placeholder="<Missing ID>"
                      handleSave={async (value) => {
                        await handleUpdateTag({
                          id: tag.id,
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
                      value={tag?.name ?? ""}
                      placeholder="<Untitled Tag>"
                      handleSave={async (value) => {
                        await handleUpdateTag({
                          id: tag.id,
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
                      value={tag?.description ?? ""}
                      placeholder="<No Description>"
                      handleSave={async (value) => {
                        await handleUpdateTag({
                          id: tag.id,
                          data: { description: value },
                        });
                      }}
                    />
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        <Divider />

        <HStack maxWidth="100%" overflow="scroll">
          <Box width="50%">
            <Heading size="md">Tagged</Heading>
            <GameObjectsTable
              tag={{
                include: [tag.id],
                exclude: [],
                untaggedFilter: "exclude",
              }}
              onGameObjectCreated={handleGameObjectCreated}
              additionalTopBarContent={(selectedRows) => (
                <AdditionalTopBarContent
                  selectedGameObjectRows={selectedRows}
                  tagId={tagId}
                />
              )}
              additionalColumns={getAdditionalColumns(tagId)}
              editable={false}
              allowCreate={false}
              omitColumns={["TAGS", "UPDATED_AT"]}
              onRowDoubleClicked={async (row) => {
                await router.push(`/game-objects/${row.id}`);
              }}
            />
          </Box>
          <Box width="50%">
            <Heading size="md">Untagged</Heading>
            <GameObjectsTable
              tag={{
                include: allTags,
                exclude: [tagId],
                untaggedFilter: "include",
              }}
              onGameObjectCreated={handleGameObjectCreated}
              additionalTopBarContent={(selectedRows) => (
                <AdditionalTopBarContent
                  selectedGameObjectRows={selectedRows}
                  tagId={tagId}
                />
              )}
              additionalColumns={getAdditionalColumns(tagId)}
              editable={false}
              allowCreate={false}
              omitColumns={["TAGS", "UPDATED_AT"]}
              onRowDoubleClicked={async (row) => {
                await router.push(`/game-objects/${row.id}`);
              }}
            />
          </Box>
        </HStack>
      </Stack>
    </>
  );
};

type AdditionalTopBarContentProps = {
  selectedGameObjectRows: GameObjectData[];
  tagId: Tag["id"];
};
function AdditionalTopBarContent(props: AdditionalTopBarContentProps) {
  const { selectedGameObjectRows, tagId } = props;

  const isDisabled = selectedGameObjectRows.length === 0;

  return (
    <>
      <ButtonGroup>
        <Tooltip
          label={isDisabled ? "Please select at least one game object." : ""}
        >
          <Box>
            <TableActionMenu
              isDisabled={isDisabled}
              selectedRows={selectedGameObjectRows}
              actionItems={(context) => (
                <>
                  <ToggleTagForSelectedGameObjects
                    context={context}
                    tagId={tagId}
                  />
                </>
              )}
            />
          </Box>
        </Tooltip>
      </ButtonGroup>
    </>
  );
}

function getAdditionalColumns(
  tagId: Tag["id"]
): AdditionalColumns<GameObjectData> {
  return {
    columns: [
      {
        cell: ({ id }) => {
          return (
            <ButtonGroup width="100%" justifyContent="start">
              <ToggleTagButton gameObjectIds={[id]} tagId={tagId} />
              {/* <ManageGameObjectButton gameObjectId={id} /> */}
            </ButtonGroup>
          );
        },
      },
    ],

    // Re-render the table the game objects table when these change
    // Without this, relationship weights might not update correctly when navigating to another game object's page
    dependencies: [tagId],
  };
}

export default TagByIdPage;

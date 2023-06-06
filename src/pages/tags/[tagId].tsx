import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  ButtonGroup,
  Divider,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { z } from "zod";
import GameObjectsTable, {
  GameObjectData,
  GameObjectsTableProps,
} from "../../features/gameobjects/containers/GameObjectsTable";
import ManageGameObjectButton from "../../features/gameobjects/containers/ManageGameObjectButton";
import CustomEditable from "../../features/shared/components/CustomEditable";
import { AdditionalColumns } from "../../features/shared/components/Table/containers/PaginatedTable";
import TableActionMenu from "../../features/shared/components/Table/containers/TableActionsMenu";
import DeleteTagButton from "../../features/tags/containers/DeleteTagButton";
import {
  SelectTagFiltersDrawerButton,
  SelectTagFiltersDrawerButtonProps,
} from "../../features/tags/containers/SelectTagFiltersDrawerButton";
import ToggleTagForSelectedGameObjects from "../../features/tags/containers/TableActionsMenu/ToggleTagForSelectedGameObjects";
import { TagFilter } from "../../features/tags/containers/TagFilterToggles";
import ToggleTagButton from "../../features/tags/containers/ToggleTagButton";
import { untaggedFilterEnum } from "../../server/shared/z";
import { api, RouterInputs } from "../../utils/api";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";

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

  const utils = api.useContext();

  const getTagByIdQuery = api.tags.getById.useQuery(
    { id: tagId },
    {
      enabled: !!tagId,
      retry: false,
      onError: (error) => {
        router.push("/tags");
      },
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const updateTagMutation = api.tags.updateById.useMutation();
  const handleUpdateTag = async (input: RouterInputs["tags"]["updateById"]) => {
    try {
      await updateTagMutation.mutateAsync(input);
      await utils.tags.invalidate();
    } catch (error) {
      window.alert("Error updating tag. See console for details.");
      console.error(error);
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

  const appliedTagFilters = useAppliedTagFilters({ tagId });

  if (getTagByIdQuery.isFetching) {
    return (
      <>
        <Head>
          <title>Tags - Loading... | 2bttns</title>
          <meta name="description" content="2bttns Tag Management" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
      </>
    );
  }

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
        <Heading size="xl">
          <CustomEditable
            value={tag?.name || ""}
            placeholder="Untitled Tag"
            handleSave={async (value) => {
              handleUpdateTag({ id: tag.id, data: { name: value } });
            }}
          />
        </Heading>
        <CustomEditable
          isTextarea
          value={tag?.description || ""}
          placeholder="No description"
          handleSave={async (value) => {
            handleUpdateTag({ id: tag.id, data: { description: value } });
          }}
        />
        <Divider />
        <Heading size="md">Tagged Game Objects</Heading>
        <GameObjectsTable
          tag={{
            include: appliedTagFilters.outputs.includeTags,
            exclude: appliedTagFilters.outputs.excludeTags,
            untaggedFilter: appliedTagFilters.outputs.untaggedFilter,
          }}
          onGameObjectCreated={handleGameObjectCreated}
          additionalTopBarContent={(selectedRows) => (
            <AdditionalTopBarContent
              selectedGameObjectRows={selectedRows}
              tagId={tagId}
              tagFilter={appliedTagFilters.state.tagFilter}
              setTagFilter={appliedTagFilters.state.setTagFilter}
            />
          )}
          additionalColumns={getAdditionalColumns(tagId)}
        />
      </Stack>
    </>
  );
};

// Tag Filters hook that provides "Applied", "Not Applied" , and "Untagged" filters
// Exposes the tagFilter state and the include/exclude tags and includeUntagged outputs
type UseAppliedTagFiltersProps = {
  tagId: Tag["id"];
};
function useAppliedTagFilters(props: UseAppliedTagFiltersProps) {
  const { tagId } = props;

  const tagsCountQuery = api.tags.getCount.useQuery();
  const tagsQuery = api.tags.getAll.useQuery(
    { take: tagsCountQuery.data?.count },
    {
      enabled: tagsCountQuery.data?.count !== undefined,
      refetchOnWindowFocus: false,
    }
  );
  const [tagFilter, setTagFilter] = useState<TagFilter>({
    Untagged: {
      tagName: "Untagged",
      on: false,
      colorScheme: "blackAlpha",
    },
    Applied: {
      tagName: "Applied",
      on: true,
      colorScheme: "green",
    },
    "Not Applied": {
      tagName: "Not Applied",
      on: false,
      colorScheme: "red",
    },
  });

  const tagsToFilterGameObjectsBy = useMemo(() => {
    return tagsQuery.data?.tags.filter((tag) => {
      if (tag.id === tagId && tagFilter["Applied"]!.on) return true;
      return tagFilter["Not Applied"]!.on;
    });
  }, [tagsQuery.data, tagFilter, tagId]);

  const includeTags = useMemo(() => {
    return tagsToFilterGameObjectsBy?.map((tag) => tag.id) || [];
  }, [tagsToFilterGameObjectsBy]);

  const excludeTags = useMemo(() => {
    if (tagFilter["Not Applied"]!.on && !tagFilter["Applied"]!.on) {
      return [tagId];
    }
    return [];
  }, [tagFilter]);

  const untaggedFilter = useMemo<z.infer<typeof untaggedFilterEnum>>(() => {
    if (!tagFilter["Untagged"]?.on) {
      return "exclude";
    }

    if (includeTags.length === 0 && excludeTags.length === 0) {
      return "untagged-only";
    }

    return "include";
  }, [tagFilter, includeTags, excludeTags]);

  return {
    state: {
      tagFilter,
      setTagFilter,
    },
    outputs: {
      includeTags,
      excludeTags,
      untaggedFilter,
    },
  };
}

type AdditionalTopBarContentProps = {
  selectedGameObjectRows: GameObjectData[];
  tagId: Tag["id"];
  tagFilter: SelectTagFiltersDrawerButtonProps["tagFilter"];
  setTagFilter: SelectTagFiltersDrawerButtonProps["setTagFilter"];
};
function AdditionalTopBarContent(props: AdditionalTopBarContentProps) {
  const { selectedGameObjectRows, tagId, tagFilter, setTagFilter } = props;

  return (
    <>
      <ButtonGroup>
        <TableActionMenu
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
        <SelectTagFiltersDrawerButton
          tagFilter={tagFilter}
          setTagFilter={setTagFilter}
        />
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
            <ButtonGroup width="100%" justifyContent="end">
              <ToggleTagButton gameObjectIds={[id]} tagId={tagId} />
              <ManageGameObjectButton gameObjectId={id} />
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

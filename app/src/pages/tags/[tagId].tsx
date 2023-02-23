import {
  Button,
  ButtonGroup,
  Code,
  Divider,
  Heading,
  Stack,
} from "@chakra-ui/react";
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import EditRelationships from "../../features/gameobjects/containers/EditRelationships";
import GameObjectsTable, {
  GameObjectsTableProps,
} from "../../features/gameobjects/containers/GameObjectsTable";
import CustomEditable from "../../features/shared/components/CustomEditable";
import TagFilterToggles, {
  TagFilter,
} from "../../features/tags/containers/TagFilterToggles";
import TagsLayoutContainer from "../../features/tags/containers/TagsLayoutContainer";
import ToggleTagButton from "../../features/tags/containers/ToggleTagButton";
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

  const deleteTagMutation = api.tags.deleteById.useMutation();
  const handleDeleteTag = async () => {
    try {
      const prompt = window.prompt(
        `Are you sure you want to delete this tag? \n\nType "DELETE" to confirm.`
      );
      if (prompt !== "DELETE") {
        window.alert("Cancelled");
        return;
      }
      if (typeof tagId !== "string") throw new Error("Invalid tag ID");
      await deleteTagMutation.mutateAsync({ id: tagId });
      router.push("/tags");
      utils.tags.invalidate();
    } catch (error) {
      window.alert("Error deleting tag. See console for details.");
      console.error(error);
    }
  };

  const getTagByIdQuery = api.tags.getById.useQuery(
    { id: tagId as string },
    {
      enabled: !!tagId || deleteTagMutation.status !== "loading",
      retry: false,
      onError: (error) => {
        console.error(error);
      },
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const updateTagMutation = api.tags.updateById.useMutation();
  const handleUpdateTag = async (input: RouterInputs["tags"]["updateById"]) => {
    try {
      await updateTagMutation.mutateAsync(input);
      utils.tags.invalidate();
    } catch (error) {
      window.alert("Error updating tag. See console for details.");
      console.error(error);
    }
  };

  const tagsQuery = api.tags.getAll.useQuery(
    {},
    { refetchOnWindowFocus: false }
  );
  const [tagFilter, setTagFilter] = useState<TagFilter>({
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
    Untagged: {
      tagName: "Untagged",
      on: false,
      colorScheme: "blackAlpha",
    },
  });

  const tagsToFilterGameObjectsBy = useMemo(() => {
    return tagsQuery.data?.tags.filter((tag) => {
      if (tag.id === tagId && tagFilter["Applied"]!.on) return true;
      return tagFilter["Not Applied"]!.on;
    });
  }, [tagsQuery.data, tagFilter, tagId]);

  const includeUntagged = tagFilter["Untagged"]!.on;

  const excludeTags = useMemo(() => {
    if (tagFilter["Not Applied"]!.on && !tagFilter["Applied"]!.on) {
      return [tagId];
    }
    return [];
  }, [tagFilter]);

  const handleGameObjectCreated: GameObjectsTableProps["onGameObjectCreated"] =
    async (gameObjectId) => {
      try {
        await updateTagMutation.mutateAsync({
          id: tagId,
          data: { addGameObjects: [gameObjectId] },
        });
      } catch (error) {
        window.alert("Error creating game object. See console for details.");
        console.error(error);
      }
    };

  if (getTagByIdQuery.isFetching) {
    return (
      <>
        <Head>
          <title>Tags - Loading... | 2bttns</title>
          <meta name="description" content="2bttns Tag Management" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <TagsLayoutContainer>
          <div>Loading...</div>
        </TagsLayoutContainer>
      </>
    );
  }

  if (getTagByIdQuery.isError) {
    return (
      <>
        <Head>
          <title>Tags - Failed to load | 2bttns</title>
          <meta name="description" content="2bttns Tag Management" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <TagsLayoutContainer>
          <div>Failed to load tag.</div>
          <Code>{getTagByIdQuery.error?.message}</Code>
        </TagsLayoutContainer>
      </>
    );
  }

  const tag = getTagByIdQuery.data?.tag;
  if (!tag) return null;

  return (
    <>
      <Head>
        <title>Tags - {tag?.name} | 2bttns</title>
        <meta name="description" content="2bttns Tag Management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TagsLayoutContainer selectedTag={tag}>
        <Stack direction="column" spacing="1rem" sx={{ padding: "1rem" }}>
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
          <TagFilterToggles
            filter={tagFilter}
            setFilter={setTagFilter}
            allAndNoneToggles
          />
          <GameObjectsTable
            tag={{
              include: tagsToFilterGameObjectsBy?.map((tag) => tag.id) || [],
              exclude: excludeTags,
              includeUntagged,
            }}
            onGameObjectCreated={handleGameObjectCreated}
            additionalActions={(gameObjectData) => (
              <>
                <EditRelationships gameObjectId={gameObjectData.id} />
                <ToggleTagButton
                  gameObjectId={gameObjectData.id}
                  tagId={tagId}
                />
              </>
            )}
          />
          <Divider />
          <Heading size="md" color="red.500">
            DANGER ZONE
          </Heading>
          <ButtonGroup>
            <Button
              colorScheme="red"
              aria-label="Delete tag"
              variant="outline"
              size="sm"
              onClick={handleDeleteTag}
            >
              Delete Tag
            </Button>
          </ButtonGroup>
        </Stack>
      </TagsLayoutContainer>
    </>
  );
};

export default TagByIdPage;

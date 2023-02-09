import {
  Button,
  ButtonGroup,
  Code,
  Divider,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import GameObjectsTableContainer from "../../features/gameobjects/containers/GameObjectsTableContainer";
import CustomEditable from "../../features/shared/components/CustomEditable";
import TagsLayoutContainer from "../../features/tags/containers/TagsLayoutContainer";
import { api, RouterInputs } from "../../utils/api";

const TagByIdPage: NextPage = () => {
  const router = useRouter();
  const { tagId } = router.query;

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
          <Text>TABLE HERE</Text>
          <GameObjectsTableContainer />
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

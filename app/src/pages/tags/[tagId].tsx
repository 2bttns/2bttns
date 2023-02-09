import { Code, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import TagsLayoutContainer from "../../features/tags/containers/TagsLayoutContainer";
import { api } from "../../utils/api";

const TagByIdPage: NextPage = () => {
  const router = useRouter();
  const { tagId } = router.query;

  const getTagByIdQuery = api.tags.getById.useQuery(
    { id: tagId as string },
    {
      enabled: !!tagId,
      retry: false,
      onError: (error) => {
        console.error(error);
      },
    }
  );

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
        <h1>Tag Details</h1>
        <Text>{tag?.name}</Text>
        <Text>{tag?.description}</Text>
      </TagsLayoutContainer>
    </>
  );
};

export default TagByIdPage;

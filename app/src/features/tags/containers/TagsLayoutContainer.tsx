import { useRouter } from "next/router";
import { api } from "../../../utils/api";
import TagsLayout, { TagsLayoutProps } from "../views/TagsLayout";

export type TagsLayoutContainerProps = {
  children: React.ReactNode;
  selectedTag?: TagsLayoutProps["selectedTag"];
};

export default function TagsLayoutContainer(props: TagsLayoutContainerProps) {
  const { children, selectedTag } = props;
  const router = useRouter();

  const getTagsQuery = api.tags.getAll.useQuery({}, { keepPreviousData: true });

  const createTagMutation = api.tags.create.useMutation();
  const handleCreateTag = async () => {
    try {
      const result = await createTagMutation.mutateAsync({ name: "New Tag" });
      await getTagsQuery.refetch();
      router.push(`/tags/${result.createdTag.id}`);
    } catch (error) {
      window.alert("Error creating tag. See console for details.");
      console.error(error);
    }
  };

  const onTagSelect: TagsLayoutProps["onTagSelect"] = (tagId) => {
    router.push(`/tags/${tagId}`);
  };

  return (
    <TagsLayout
      tags={
        getTagsQuery.data?.tags.map((tag) => {
          return {
            ...tag,
            createdAt: new Date(tag.createdAt),
            updatedAt: new Date(tag.updatedAt),
          };
        }) || []
      }
      selectedTag={selectedTag}
      handleCreateTag={handleCreateTag}
      onTagSelect={onTagSelect}
      children={children}
    />
  );
}

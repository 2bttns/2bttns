import { useRouter } from "next/router";
import { api } from "../../../utils/api";
import TagsLayout, { TagsLayoutProps } from "../views/TagsLayout";

export type TagsLayoutContainerProps = {
  children: React.ReactNode;
  selectedTag?: TagsLayoutProps["selectedTag"];
};

export default function TagsLayoutContainer(props: TagsLayoutContainerProps) {
  const { children, selectedTag } = props;

  const getTagsQuery = api.tags.getAll.useQuery();

  const createTagMutation = api.tags.create.useMutation();
  const handleCreateTag = async () => {
    try {
      await createTagMutation.mutateAsync({ name: "New Tag" });
      await getTagsQuery.refetch();
    } catch (error) {
      window.alert("Error creating tag. See console for details.");
      console.error(error);
    }
  };

  const router = useRouter();
  const onTagSelect: TagsLayoutProps["onTagSelect"] = (tagId) => {
    router.push(`/tags/${tagId}`);
  };

  return (
    <TagsLayout
      tags={getTagsQuery.data?.tags || []}
      selectedTag={selectedTag}
      handleCreateTag={handleCreateTag}
      onTagSelect={onTagSelect}
      children={children}
    />
  );
}

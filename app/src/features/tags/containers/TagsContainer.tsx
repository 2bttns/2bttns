import { Button, Select, Stack } from "@chakra-ui/react";
import { api } from "../../../utils/api";

export type TagsContainerProps = {};

export default function TagsContainer(props: TagsContainerProps) {
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

  return (
    <Stack direction="row">
      <Stack flex={1} minWidth="128px">
        <h1>Tags</h1>
        <Button variant="outline" colorScheme="blue" onClick={handleCreateTag}>
          Create New Tag
        </Button>
        <Select>
          {getTagsQuery.data?.tags.map((tag) => {
            const { id, name } = tag;
            return (
              <option key={id} value={id}>
                {name}
              </option>
            );
          })}
        </Select>
      </Stack>
      <Stack flex={5}>
        <h1>Editable Tag Name</h1>
        <h1>Editable Tag Description</h1>

        <h2>Manage Game Objects Related to Tag</h2>
      </Stack>
    </Stack>
  );
}

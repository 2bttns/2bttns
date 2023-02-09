import { Select, Stack } from "@chakra-ui/react";

export type TagsContainerProps = {};

export default function TagsContainer(props: TagsContainerProps) {
  return (
    <Stack direction="row">
      <Stack flex={1} minWidth="128px">
        <h1>Tags</h1>
        <h2>Create New Tag</h2>
        <Select>
          {[1, 2, 3].map((tag) => (
            <option value={tag}>{tag}</option>
          ))}
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

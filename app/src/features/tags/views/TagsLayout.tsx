import { Button, Select, Stack } from "@chakra-ui/react";
import { Tag } from "@prisma/client";

export type TagsLayoutProps = {
  children: React.ReactNode;
  tags: Tag[];
  selectedTag?: Tag;
  onTagSelect: (tagId: Tag["id"]) => void;
  handleCreateTag: () => void;
};

export default function TagsLayout(props: TagsLayoutProps) {
  const {
    children,
    tags,
    selectedTag = null,
    handleCreateTag,
    onTagSelect,
  } = props;

  return (
    <Stack direction="row" width="100%" height="100%">
      <Stack flex={1} minWidth="128px" height="100%">
        <h1>Tags</h1>
        <Button variant="outline" colorScheme="blue" onClick={handleCreateTag}>
          Create New Tag
        </Button>
        <Select
          onChange={(e) => {
            const tagId = e.currentTarget.value;
            onTagSelect(tagId);
          }}
          placeholder="Select a tag"
          value={selectedTag?.id}
          bgColor="gray.200"
        >
          {tags.map((tag) => {
            const { id, name } = tag;
            return (
              <option key={id} value={id}>
                {name || "Untitled Tag"}
              </option>
            );
          })}
        </Select>
      </Stack>
      <Stack flex={5} height="100%" overflow="scroll">
        {children}
      </Stack>
    </Stack>
  );
}

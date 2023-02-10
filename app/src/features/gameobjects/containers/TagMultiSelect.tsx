import { Box, Tag as ChakraTag } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import NextLink from "next/link";
import { useMemo } from "react";
import { MultiSelect, Option } from "react-multi-select-component";
import { api } from "../../../utils/api";

export interface TagOption extends Option {
  value: Tag["id"];
  label: Tag["name"];
}

export type TagMultiSelectProps = {
  selected: TagOption[];
  onChange: (tags: TagOption["value"][]) => void;
};

export default function TagMultiSelect(props: TagMultiSelectProps) {
  const { selected, onChange } = props;

  const tagsQuery = api.tags.getAll.useQuery(
    {},
    { keepPreviousData: true, refetchOnWindowFocus: false }
  );

  const options: Option[] = useMemo(() => {
    if (!tagsQuery.data?.tags) return [];

    return tagsQuery.data.tags.map((tag) => ({
      value: tag.id,
      label: tag.name || "Untitled Tag",
    }));
  }, [tagsQuery.data]);

  const setSelected = async (nextValue: Option[]) => {
    const nextOptions = nextValue.map((option) => option.value as string);
    onChange(nextOptions);
  };

  return (
    <Box>
      <MultiSelect
        options={options}
        value={selected}
        onChange={setSelected}
        labelledBy="Select"
        valueRenderer={(selected) => {
          return selected.map((option) => {
            return (
              <NextLink href={`/tags/${option.value}`}>
                <ChakraTag
                  size="sm"
                  variant="solid"
                  colorScheme={"green"}
                  mr={1}
                >
                  {option.label}
                </ChakraTag>
              </NextLink>
            );
          });
        }}
      />
    </Box>
  );
}

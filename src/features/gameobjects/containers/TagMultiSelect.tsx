import {
  Box,
  Checkbox,
  HStack,
  Tag as ChakraTag,
  Tooltip,
} from "@chakra-ui/react";
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
  isEditable?: boolean;
};

export default function TagMultiSelect(props: TagMultiSelectProps) {
  const { selected, onChange, isEditable = true } = props;

  const tagsQuery = api.tags.getAll.useQuery(
    {},
    { keepPreviousData: true, refetchOnWindowFocus: false }
  );

  const options: Option[] = useMemo(() => {
    if (!tagsQuery.data?.tags) return [];

    return tagsQuery.data.tags
      .map((tag) => ({
        value: tag.id,
        label: tag.name || "Untitled Tag",
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tagsQuery]);

  const setSelected = async (nextValue: Option[]) => {
    const nextOptions = nextValue.map((option) => option.value as string);
    onChange(nextOptions);
  };

  return (
    <Box>
      <MultiSelect
        options={isEditable ? options : selected}
        value={selected}
        onChange={setSelected}
        labelledBy="Select"
        hasSelectAll={false}
        ClearSelectedIcon={null}
        ItemRenderer={(item: {
          option: TagOption;
          checked: boolean;
          onClick: () => void;
        }) => {
          const { option, checked, onClick } = item;
          return (
            <Item
              option={option}
              checked={checked}
              onClick={onClick}
              isEditable={isEditable}
            />
          );
        }}
        valueRenderer={(selected) => {
          return <SelectedTags selected={selected as TagOption[]} />;
        }}
      />
    </Box>
  );
}

type SelectedTagsProps = {
  selected: TagOption[];
};
function SelectedTags(props: SelectedTagsProps) {
  const { selected } = props;
  const sorted = selected.sort((a, b) => a.label.localeCompare(b.label));

  const firstItem = sorted[0];
  if (!firstItem) return <>No Tags Applied</>;

  return (
    <>
      <Tooltip
        label={`Click to view ${firstItem.label}`}
        placement="top"
        hasArrow
      >
        <NextLink href={`/tags/${firstItem.value}`}>
          <ChakraTag size="sm" variant="solid" colorScheme={"green"} mr={1}>
            {firstItem.label}
          </ChakraTag>
        </NextLink>
      </Tooltip>
      {selected.length - 1 > 0 && (
        <ChakraTag size="sm" variant="outline" colorScheme={"green"} mr={1}>
          + {selected.length - 1} More
        </ChakraTag>
      )}
    </>
  );
}

type ItemProps = {
  option: TagOption;
  checked: boolean;
  isEditable: boolean;
  onClick: () => void;
};

function Item(props: ItemProps) {
  const { option, checked, isEditable, onClick } = props;
  return (
    <HStack justifyContent="space-between">
      <Tooltip label={`Click to view ${option.label}`} placement="top" hasArrow>
        <NextLink href={`/tags/${option.value}`}>
          <ChakraTag
            size="sm"
            variant={checked ? "solid" : "outline"}
            colorScheme={checked ? "green" : "gray"}
            mr={1}
          >
            {option.label}
          </ChakraTag>
        </NextLink>
      </Tooltip>
      {isEditable && (
        <Checkbox
          animation="none"
          isChecked={checked}
          onChange={onClick}
          backgroundColor="white"
          colorScheme="green"
        />
      )}
    </HStack>
  );
}

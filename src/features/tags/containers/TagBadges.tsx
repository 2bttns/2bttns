import {
  Box,
  Flex,
  Link as ChakraLink,
  Tag as ChakraTag,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import NextLink from "next/link";
import { useMemo, useState } from "react";
import { Option } from "react-multi-select-component";

export interface TagOption extends Option {
  value: Tag["id"];
  label: Tag["name"];
}

export type TagBadgesProps = {
  selectedTags: { id: Tag["id"]; name: Tag["name"] }[];
  collapseLetterLimit?: number | "disabled";
};

export default function TagBadges(props: TagBadgesProps) {
  const { selectedTags, collapseLetterLimit = 32 } = props;

  const shouldCollapse =
    collapseLetterLimit !== "disabled" &&
    selectedTags.reduce((acc, { name }) => {
      return acc + name.length;
    }, 0) > collapseLetterLimit;
  const numTagBadgesNonCollapsed = useMemo(() => {
    if (!shouldCollapse) return selectedTags.length;

    let remainingLetters = collapseLetterLimit;
    let numTags = 0;
    selectedTags.forEach(({ name }) => {
      remainingLetters -= name.length;
      if (remainingLetters > 0) {
        numTags++;
      }
    });
    return numTags;
  }, [shouldCollapse, selectedTags]);

  const numTagBadgesCollapsed = selectedTags.length - numTagBadgesNonCollapsed;

  const [isCollapsed, setCollapsed] = useState(true);
  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const tagBadges = selectedTags.map(({ id, name }) => {
    return (
      <Tooltip
        label={`Click to view tag: ${name}`}
        placement="top"
        hasArrow
        key={`tag-badge-${id}`}
      >
        <NextLink href={`/tags/${id}`}>
          <ChakraTag size="sm" variant="solid" colorScheme={"green"} mr={1}>
            {name}
          </ChakraTag>
        </NextLink>
      </Tooltip>
    );
  });

  return (
    <VStack width="100%" alignItems="start">
      <Flex flexWrap="wrap" gap="4px">
        {tagBadges.slice(0, numTagBadgesNonCollapsed)}
        {!isCollapsed && tagBadges.slice(numTagBadgesNonCollapsed)}
      </Flex>
      {shouldCollapse && (
        <Box alignSelf="end">
          <ChakraLink onClick={toggleCollapse} color="blue.500">
            {isCollapsed ? `Show ${numTagBadgesCollapsed} More` : "Collapse"}
          </ChakraLink>
        </Box>
      )}
    </VStack>
  );
}

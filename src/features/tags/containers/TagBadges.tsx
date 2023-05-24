import { Box, Flex, Tag as ChakraTag, Tooltip } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import NextLink from "next/link";
import { Option } from "react-multi-select-component";

export interface TagOption extends Option {
  value: Tag["id"];
  label: Tag["name"];
}

export type TagBadgesProps = {
  selectedTags: { id: Tag["id"]; name: Tag["name"] }[];
};

export default function TagBadges(props: TagBadgesProps) {
  const { selectedTags } = props;

  return (
    <Box>
      <Flex flexWrap="wrap" gap="4px">
        {selectedTags.map(({ id, name }) => {
          return (
            <Tooltip
              label={`Click to view tag: ${name}`}
              placement="top"
              hasArrow
            >
              <NextLink href={`/tags/${id}`}>
                <ChakraTag
                  size="sm"
                  variant="solid"
                  colorScheme={"green"}
                  mr={1}
                >
                  {name}
                </ChakraTag>
              </NextLink>
            </Tooltip>
          );
        })}
      </Flex>
    </Box>
  );
}

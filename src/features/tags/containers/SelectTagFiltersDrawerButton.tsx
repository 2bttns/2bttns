import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useMemo } from "react";
import TagFilterToggles from "./TagFilterToggles";
import useAllTagFilters from "../hooks/useAllTagFilters";

export type SelectTagFiltersDrawerButtonProps = {
  tagFilter: ReturnType<typeof useAllTagFilters>;
};
export function SelectTagFiltersDrawerButton(
  props: SelectTagFiltersDrawerButtonProps
) {
  const { tagFilter } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const selectedTagsCount = useMemo(() => {
    const selectedCustomTags = tagFilter.results.includeTags.map((tag) => tag);
    let count = selectedCustomTags.length;
    if (tagFilter.results.includeUntagged) {
      count += 1;
    }
    return count;
  }, [tagFilter.state.tagFilter]);
  const totalTagsCount = Object.keys(tagFilter.state.tagFilter).length;

  return (
    <>
      <Button
        colorScheme={selectedTagsCount === 0 ? "red" : "teal"}
        variant={selectedTagsCount === 0 ? "outline" : "solid"}
        onClick={onOpen}
      >
        Filters ({selectedTagsCount}/{totalTagsCount})
      </Button>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Tag Filters</DrawerHeader>

          <DrawerBody>
            <TagFilterToggles
              filter={tagFilter.state.tagFilter}
              setFilter={tagFilter.state.setTagFilter}
              allAndNoneToggles
            />
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

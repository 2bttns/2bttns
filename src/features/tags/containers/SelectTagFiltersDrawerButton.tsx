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
import { Dispatch, SetStateAction, useMemo } from "react";
import TagFilterToggles, {
  TagFilter,
  TagFilterTogglesProps,
} from "./TagFilterToggles";

export type SelectTagFiltersDrawerButtonProps = {
  tagFilter: TagFilter;
  setTagFilter: Dispatch<SetStateAction<TagFilter>>;
  tagFilterLoading?: boolean;
  drawerTitle?: string;
  allAndNoneToggles?: TagFilterTogglesProps["allAndNoneToggles"];
};
export function SelectTagFiltersDrawerButton(
  props: SelectTagFiltersDrawerButtonProps
) {
  const {
    tagFilter,
    setTagFilter,
    tagFilterLoading = false,
    drawerTitle = "Tag Filters",
    allAndNoneToggles = true,
  } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const selectedTagsCount = useMemo(() => {
    return Object.values(tagFilter).filter((f) => f.on).length;
  }, [tagFilter]);
  const totalTagsCount = Object.keys(tagFilter).length;

  const countString = tagFilterLoading
    ? ""
    : ` (${selectedTagsCount}/${totalTagsCount})`;

  return (
    <>
      <Button
        colorScheme={selectedTagsCount === 0 ? "red" : "teal"}
        variant={selectedTagsCount === 0 ? "outline" : "solid"}
        onClick={onOpen}
      >
        Filters{countString}
      </Button>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{drawerTitle}</DrawerHeader>

          <DrawerBody>
            <TagFilterToggles
              filter={tagFilter}
              setFilter={setTagFilter}
              allAndNoneToggles={allAndNoneToggles}
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

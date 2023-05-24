import { Button, ButtonProps, Flex } from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";

export type TagFilter = {
  [tagId: string]: {
    tagName: string;
    on: boolean;
    colorScheme?: ButtonProps["colorScheme"];
    onToggle?: (
      on: boolean,
      filter: TagFilterTogglesProps["filter"],
      setFilter: TagFilterTogglesProps["setFilter"]
    ) => void;
  };
};

export type TagFilterTogglesProps = {
  filter: TagFilter;
  setFilter: Dispatch<SetStateAction<TagFilter>>;
  allAndNoneToggles?: boolean;
};
export default function TagFilterToggles(props: TagFilterTogglesProps) {
  const { filter, setFilter, allAndNoneToggles = false } = props;

  const handleToggleAll = (on: boolean) => {
    setFilter((prevFilter) => {
      if (!prevFilter) return prevFilter;
      const newFilter = { ...prevFilter };
      Object.keys(newFilter).forEach((tagId) => {
        newFilter[tagId]!.on = on;
        newFilter[tagId]!.onToggle?.(on, newFilter, setFilter);
      });
      return newFilter;
    });
  };

  const areAllOn = Object.values(filter).every((tag) => tag.on);
  const areAllOff = Object.values(filter).every((tag) => !tag.on);

  return (
    <>
      <Flex gap="4px" flexWrap="wrap">
        {allAndNoneToggles && (
          <>
            <Button
              key="All"
              colorScheme="blackAlpha"
              onClick={() => handleToggleAll(true)}
              variant={areAllOn ? "solid" : "ghost"}
              size="sm"
            >
              All
            </Button>
            <Button
              key="None"
              colorScheme="blackAlpha"
              onClick={() => handleToggleAll(false)}
              variant={areAllOff ? "solid" : "ghost"}
              size="sm"
            >
              None
            </Button>
          </>
        )}

        {Object.entries(filter).map(([tagId, { tagName, on, colorScheme }]) => {
          const handleClick = () => {
            setFilter((prevFilter) => {
              if (!prevFilter || !prevFilter[tagId]) return prevFilter;
              const newFilter = { ...prevFilter };
              newFilter[tagId]!.on = !on;
              newFilter[tagId]!.onToggle?.(!on, newFilter, setFilter);
              return newFilter;
            });
          };
          return (
            <Button
              key={tagId}
              colorScheme={colorScheme}
              onClick={handleClick}
              variant={on ? "solid" : "outline"}
              size="sm"
            >
              {tagName}
            </Button>
          );
        })}
      </Flex>
    </>
  );
}

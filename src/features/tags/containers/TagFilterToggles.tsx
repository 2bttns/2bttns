import { Button, ButtonProps, Checkbox, Divider, Flex } from "@chakra-ui/react";
import { Dispatch, MouseEventHandler, SetStateAction } from "react";

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
  handleChange?: (filter: TagFilter) => void;
};
export default function TagFilterToggles(props: TagFilterTogglesProps) {
  const { filter, setFilter, allAndNoneToggles = false, handleChange } = props;

  const handleToggleAll = (on: boolean) => {
    setFilter((prevFilter) => {
      if (!prevFilter) return prevFilter;
      const newFilter = { ...prevFilter };
      Object.keys(newFilter).forEach((tagId) => {
        newFilter[tagId]!.on = on;
        newFilter[tagId]!.onToggle?.(on, newFilter, setFilter);
      });
      if (handleChange) {
        handleChange(newFilter);
      }
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
              size="sm"
              rightIcon={<CheckboxIcon on={areAllOn} />}
            >
              All
            </Button>
            <Button
              key="None"
              colorScheme="blackAlpha"
              onClick={() => handleToggleAll(false)}
              size="sm"
              rightIcon={<CheckboxIcon on={areAllOff} />}
            >
              None
            </Button>
          </>
        )}

        <Divider my="1rem" />

        {Object.entries(filter).map(([tagId, { tagName, on, colorScheme }]) => {
          const handleClick: MouseEventHandler = (e) => {
            e.stopPropagation();
            setFilter((prevFilter) => {
              if (!prevFilter || !prevFilter[tagId]) return prevFilter;
              const newFilter = { ...prevFilter };
              newFilter[tagId]!.on = !on;
              newFilter[tagId]!.onToggle?.(!on, newFilter, setFilter);

              if (handleChange) {
                handleChange(newFilter);
              }
              return newFilter;
            });
          };
          return (
            <Button
              key={tagId}
              colorScheme={colorScheme}
              onClick={handleClick}
              size="sm"
              rightIcon={<CheckboxIcon on={on} />}
            >
              {tagName}
            </Button>
          );
        })}
      </Flex>
    </>
  );
}

type CheckboxIconProps = {
  on: boolean;
};
function CheckboxIcon(props: CheckboxIconProps) {
  const { on } = props;
  return (
    <Checkbox
      isChecked={on}
      isDisabled
      sx={{
        userSelect: "none",
        cursor: "pointer",
        _disabled: {
          cursor: "pointer",
          userSelect: "none",
        },
      }}
    />
  );
}

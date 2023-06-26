import { AddIcon, CloseIcon, SearchIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Kbd,
  Spinner,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import { ReactNode, useEffect, useRef, useState } from "react";

export type SearchAndCreateBarProps = {
  value: string | undefined;
  onChange: (search: string) => void;
  onCreate?: (name: string) => Promise<void>;
  tooltipLabel?: ReactNode;
  allowCreateWithEmptyValue?: boolean;
};

// Input for updating a search string state variable
// Has a button that uses the search string as a parameter for a custom create function
export default function SearchAndCreateBar(props: SearchAndCreateBarProps) {
  const {
    value,
    onChange,
    onCreate,
    tooltipLabel = "Create new item with input as name",
    allowCreateWithEmptyValue = false,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  const [isCreating, setIsCreating] = useState(false);
  const handleCreate = async () => {
    if (!onCreate) return;
    if (isCreating) return;
    if (!allowCreateWithEmptyValue && !value) return;

    setIsCreating(true);
    await onCreate(value ?? "");
    setIsCreating(false);
  };

  useEffect(() => {
    // Return focus to input when creating is done
    if (!isCreating) {
      inputRef.current?.focus();
    }
  }, [isCreating]);

  const clearInput = () => {
    onChange("");
  };

  return (
    <Stack direction="row" width="100%">
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          color="gray.300"
          fontSize="1.2em"
        >
          <SearchIcon />
        </InputLeftElement>
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by name or id"
          onKeyUp={async (e) => {
            if (e.key === "Enter" && e.shiftKey) {
              await handleCreate();
            }
          }}
          bgColor="gray.200"
          isDisabled={isCreating}
          ref={inputRef}
          focusBorderColor="twobttns.green"
        />
        {onCreate && (
          <InputRightElement>
            <Tooltip
              label={
                isCreating ? (
                  "Creating..."
                ) : (
                  <Stack
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    spacing="0"
                    padding="0.5rem"
                  >
                    <div>{tooltipLabel}</div>
                    <div>
                      <Kbd backgroundColor="gray.900">shift</Kbd>
                      <span>+</span>
                      <Kbd backgroundColor="gray.900">enter</Kbd>
                    </div>
                  </Stack>
                )
              }
              placement="bottom-end"
              hasArrow
            >
              <IconButton
                colorScheme="green"
                icon={isCreating ? <Spinner size="sm" /> : <AddIcon />}
                aria-label="Create new item"
                size="sm"
                onClick={handleCreate}
                isDisabled={isCreating}
              />
            </Tooltip>
          </InputRightElement>
        )}
        <InputRightElement marginRight={onCreate ? "2rem" : "0rem"}>
          {!isCreating && (
            <Tooltip label="Clear input" placement="bottom-end" hasArrow>
              <CloseIcon
                color="gray.500"
                display={value ? "block" : "none"}
                onClick={clearInput}
                cursor="pointer"
              />
            </Tooltip>
          )}
        </InputRightElement>
      </InputGroup>
    </Stack>
  );
}

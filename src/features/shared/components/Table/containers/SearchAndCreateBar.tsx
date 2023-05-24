import { AddIcon, CloseIcon, SearchIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Kbd,
  Stack,
  Tooltip,
} from "@chakra-ui/react";

export type SearchAndCreateBarProps = {
  value: string | undefined;
  onChange: (search: string) => void;
  onCreate?: (name: string) => void;
};

// Input for updating a search string state variable
// Has a button to create a new game object with the search string as the name, if a create function is provided
export default function SearchAndCreateBar(props: SearchAndCreateBarProps) {
  const { value, onChange, onCreate } = props;

  const handleCreate = () => {
    if (!value) return;
    if (!onCreate) return;
    onCreate(value);
  };

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
          onKeyUp={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              handleCreate();
            }
          }}
          bgColor="gray.200"
        />
        {onCreate && (
          <InputRightElement>
            <Tooltip
              label={
                <Stack
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  spacing="0"
                  padding="0.5rem"
                >
                  <div>Create new item with input as name</div>
                  <div>
                    <Kbd backgroundColor="gray.900">shift</Kbd>
                    <span>+</span>
                    <Kbd backgroundColor="gray.900">enter</Kbd>
                  </div>
                </Stack>
              }
              placement="bottom-end"
              hasArrow
            >
              <IconButton
                colorScheme="blue"
                icon={<AddIcon />}
                aria-label="Create new item"
                size="sm"
                onClick={handleCreate}
              />
            </Tooltip>
          </InputRightElement>
        )}
        <InputRightElement marginRight={onCreate ? "2rem" : "0rem"}>
          <Tooltip label="Clear input" placement="bottom-end" hasArrow>
            <CloseIcon
              color="gray.500"
              display={value ? "block" : "none"}
              onClick={clearInput}
              cursor="pointer"
            />
          </Tooltip>
        </InputRightElement>
      </InputGroup>
    </Stack>
  );
}

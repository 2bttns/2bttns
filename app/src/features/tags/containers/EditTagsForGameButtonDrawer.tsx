import {
  Box,
  Button,
  ButtonGroup,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  IconButton,
  Stack,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { FaTags } from "react-icons/fa";
import { api } from "../../../utils/api";
import { GameData } from "../../games/containers/GamesTable";
import ManageTagButton from "./ManageTagButton";
import TagsTable, { columnIds } from "./TagsTable";
import ToggleTagForGameButton from "./ToggleTagForGameButton";

export type EditTagsForGameButtonDrawerProps = {
  gameId: GameData["id"];
};
export function EditTagsForGameButtonDrawer(
  props: EditTagsForGameButtonDrawerProps
) {
  const { gameId } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Tooltip label="Edit Tags" placement="top">
        <IconButton
          icon={<FaTags />}
          aria-label="Edit Tags"
          size="sm"
          colorScheme="green"
          onClick={() => {
            onOpen();
          }}
        />
      </Tooltip>
      <EditTagsForGameDrawer
        isOpen={isOpen}
        onClose={onClose}
        gameId={gameId}
      />
    </>
  );
}

export type EditTagsForGameDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  gameId: GameData["id"];
};

export function EditTagsForGameDrawer(props: EditTagsForGameDrawerProps) {
  const { isOpen, onClose, gameId } = props;

  const gameQuery = api.games.getById.useQuery({ id: gameId });
  const name = gameQuery.data?.game.name ?? "Untitled Game";

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          Edit Input Tags for Game
        </DrawerHeader>

        <DrawerBody overflow="hidden">
          <Box>
            <Heading as="h2" size="sm" fontWeight="400">
              {name} (id={gameId})
            </Heading>
          </Box>
          <Stack spacing="24px" height="100%" mt="1rem">
            <TagsTable
              allowCreate={false}
              omitColumns={["DESCRIPTION", "UPDATED_AT"]}
              editable={false}
              areRowsSelectable={false}
              additionalColumns={{
                columns: [
                  {
                    id: "actions",
                    cell: (row) => {
                      return (
                        <>
                          <ButtonGroup>
                            <ToggleTagForGameButton
                              gameId={gameId}
                              tagId={row.id}
                            />
                            <ManageTagButton tagId={row.id} />
                          </ButtonGroup>
                        </>
                      );
                    },
                  },
                ],
                dependencies: [],
              }}
              defaultSortAsc={true}
              defaultSortFieldId={columnIds.NAME}
            />
          </Stack>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button variant="outline" mr={3} onClick={onClose}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

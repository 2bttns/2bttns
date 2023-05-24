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
  FormLabel,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import Link from "next/link";
import { FaTags } from "react-icons/fa";
import { GameObjectData } from "../../gameobjects/containers/GameObjectsTable";
import ManageTagButton from "./ManageTagButton";
import TagsTable from "./TagsTable";
import ToggleTagButton from "./ToggleTagButton";

export type EditTagsForGameObjectsButtonDrawerProps = {
  gameObjectId: GameObjectData["id"];
  gameObjectName: GameObjectData["name"];
};
export function EditTagsForGameObjectsButtonDrawer(
  props: EditTagsForGameObjectsButtonDrawerProps
) {
  const { gameObjectId, gameObjectName } = props;
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
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Edit Game Object Tags
          </DrawerHeader>

          <DrawerBody overflow="hidden">
            <Stack spacing="24px" height="100%">
              <Box>
                <FormLabel htmlFor="username">
                  <Text display="inline">
                    Game Object: {gameObjectName || "Unnamed Gameobject"}{" "}
                  </Text>
                  <Link href={`/game-objects/${gameObjectId}`}>
                    <Text color="blue.500" display="inline">
                      ({gameObjectId})
                    </Text>
                  </Link>
                </FormLabel>
              </Box>

              <TagsTable
                allowCreate={false}
                hideColumns={{
                  updatedAt: true,
                  description: true,
                }}
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
                              <ToggleTagButton
                                gameObjectId={gameObjectId}
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
    </>
  );
}

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
  IconButton,
  Link as ChakraLink,
  ListItem,
  OrderedList,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useWindowWidth } from "@react-hook/window-size";
import Link from "next/link";
import { useEffect } from "react";
import { FaTags } from "react-icons/fa";
import { api } from "../../../utils/api";
import { GameObjectData } from "../../gameobjects/containers/GameObjectsTable";
import ManageTagButton from "./ManageTagButton";
import TagsTable, { columnIds } from "./TagsTable";
import ToggleTagForGameObjectsButton from "./ToggleTagForGameObjectsButton";

export type EditTagsForGameObjectsButtonDrawerProps = {
  gameObjectIds: GameObjectData["id"][];
};
export function EditTagsForGameObjectsButtonDrawer(
  props: EditTagsForGameObjectsButtonDrawerProps
) {
  const { gameObjectIds } = props;
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
      <EditTagsForGameObjectsDrawer
        isOpen={isOpen}
        onClose={onClose}
        gameObjectIds={gameObjectIds}
      />
    </>
  );
}

type GameObjectDetailsProps = {
  gameObjectIds: EditTagsForGameObjectsButtonDrawerProps["gameObjectIds"];
};

export type EditTagsForGameObjectsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  gameObjectIds: string[];
};

export function EditTagsForGameObjectsDrawer(
  props: EditTagsForGameObjectsDrawerProps
) {
  const { isOpen, onClose, gameObjectIds } = props;

  useEffect(() => {
    if (gameObjectIds.length === 0) {
      onClose();
    }
  }, [gameObjectIds, onClose]);

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          Editing Game Object Tags ({gameObjectIds.length})
        </DrawerHeader>

        <DrawerBody overflow="hidden">
          <Stack spacing="24px" height="100%">
            <GameObjectDetails gameObjectIds={gameObjectIds} />

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
                            <ToggleTagForGameObjectsButton
                              gameObjectIds={gameObjectIds}
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

function GameObjectDetails(props: GameObjectDetailsProps) {
  const { gameObjectIds } = props;

  const gameObjectsCountQuery = api.gameObjects.getCount.useQuery({
    idFilter: gameObjectIds.join(","),
  });
  const gameObjectsQuery = api.gameObjects.getAll.useQuery(
    {
      idFilter: gameObjectIds.join(","),
      take: gameObjectsCountQuery.data?.count ?? 0,
    },
    { enabled: gameObjectsCountQuery.isSuccess }
  );

  const items = gameObjectsQuery.data?.gameObjects.map(({ id, name }) => {
    return (
      <Box key={id} whiteSpace="nowrap">
        <Text display="inline">{name || "Unnamed Gameobject"} </Text>
        <Link href={`/game-objects/${id}`}>
          <Text color="blue.500" display="inline">
            ({id})
          </Text>
        </Link>
      </Box>
    );
  });

  const { onOpen, onClose, isOpen } = useDisclosure();
  const windowWidth = useWindowWidth();
  useEffect(() => {
    onClose();
  }, [windowWidth, onClose]);

  if (!items) return null;

  return (
    <>
      <Box>
        <Text display="inline">{items[0]}</Text>
        {items.length > 1 && (
          <>
            <Text display="inline"> & </Text>
            <Popover
              isOpen={isOpen}
              onOpen={onOpen}
              onClose={onClose}
              placement="bottom"
              offset={[0, -16]}
              closeOnBlur
            >
              <PopoverTrigger>
                <Tooltip label="Click to view selected game objects info">
                  <ChakraLink
                    display="inline"
                    color="blue.500"
                    marginLeft="auto"
                    onClick={() => {
                      isOpen ? onClose() : onOpen();
                    }}
                  >
                    {items.length - 1} more
                  </ChakraLink>
                </Tooltip>
              </PopoverTrigger>
              <PopoverContent
                p={5}
                width={{ base: "100vw", sm: "256px", md: "512px" }}
              >
                <PopoverArrow />
                <PopoverCloseButton />
                <Box
                  overflow="scroll"
                  minHeight="128px"
                  maxHeight="256px"
                  maxWidth={{ base: "100vw", sm: "256px", md: "512px" }}
                >
                  <OrderedList width="100%" height="100%" paddingLeft="1rem">
                    {items.map((item, index) => {
                      return <ListItem key={index}>{item}</ListItem>;
                    })}
                  </OrderedList>
                </Box>
              </PopoverContent>
            </Popover>
          </>
        )}
      </Box>
    </>
  );
}

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  IconButton,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Game } from "@prisma/client";
import { useState } from "react";
import { FaPalette } from "react-icons/fa";
import ConfirmAlert from "../../../shared/components/ConfirmAlert";
import { GameData } from "../GamesTable";
import CustomCssEditor from "./CustomCssEditor";

export type CustomCssEditorDrawerProps = {
  gameId: EditCustomCssDrawerProps["gameId"];
  gameName: EditCustomCssDrawerProps["gameName"];
  customCss: EditCustomCssDrawerProps["customCss"];
  setCustomCss: EditCustomCssDrawerProps["setCustomCss"];
  onSave: EditCustomCssDrawerProps["onSave"];
};
export function CustomCssEditorDrawer(props: CustomCssEditorDrawerProps) {
  const { gameId, gameName, customCss, setCustomCss, onSave } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Tooltip label="Edit Custom CSS" placement="top">
        <IconButton
          icon={<FaPalette />}
          aria-label="Edit Custom CSS"
          size="sm"
          colorScheme="blue"
          onClick={() => {
            onOpen();
          }}
        />
      </Tooltip>
      <EditCustomCssDrawer
        isOpen={isOpen}
        onClose={onClose}
        gameId={gameId}
        gameName={gameName}
        customCss={customCss}
        setCustomCss={setCustomCss}
        onSave={onSave}
      />
    </>
  );
}

export type EditCustomCssDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  gameId: GameData["id"];
  gameName: GameData["name"];
  customCss: Game["customCss"];
  setCustomCss: (value: string) => void;
  onSave: (toSave: string) => Promise<void>;
};

export function EditCustomCssDrawer(props: EditCustomCssDrawerProps) {
  const { isOpen, onClose, gameId, gameName, customCss, setCustomCss, onSave } =
    props;
  const toast = useToast();

  const {
    isOpen: cancelAlertOpen,
    onOpen: onOpenCancelAlert,
    onClose: onCloseCancelAlert,
  } = useDisclosure();

  const handleSave = async () => {
    try {
      await onSave(customCss ?? "");
      toast.closeAll();
      toast({
        title: `Saved`,
        status: "success",
      });
    } catch (error) {
      console.error(error);
      toast.closeAll();
      toast({
        title: `Save Error`,
        description:
          "An error occurred while saving the custom CSS. Check the console for details.",
        status: "error",
      });
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="lg"
      closeOnEsc={false}
      closeOnOverlayClick={false}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          Edit Custom CSS for Game
        </DrawerHeader>

        <DrawerBody overflow="hidden">
          <Box>
            <Heading as="h2" size="sm" fontWeight="400">
              {gameName ?? "Untitled Game"} (id={gameId})
            </Heading>
          </Box>

          <CustomCssEditor
            value={customCss ?? ""}
            onChange={(nextValue) => {
              setCustomCss(nextValue);
            }}
          />
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <ConfirmAlert
            alertTitle={
              <Box>
                <Text>Close the editor?</Text>

                <Text fontSize="14px" fontWeight="400">
                  Any changes you made will not be saved.
                </Text>
              </Box>
            }
            cancelText="Cancel"
            handleConfirm={async () => {
              onClose();
            }}
            isOpen={cancelAlertOpen}
            onClose={onCloseCancelAlert}
          />
          <Button
            variant="outline"
            mr={3}
            onClick={onOpenCancelAlert}
            colorScheme="red"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            mr={3}
            onClick={handleSave}
            colorScheme="green"
          >
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

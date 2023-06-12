import { Box, MenuItem, Text, useDisclosure } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { api, apiClient } from "../../../../../../utils/api";
import ConfirmAlert from "../../../ConfirmAlert";
import { TableActionMenuContext } from "./index";

export type TableActionsMenuItemImportJSON<T extends object> = {
  context: TableActionMenuContext<T>;
};
/**
 * Add this to the `actionItems` prop of a `TableActionMenu` to add an "Import JSON" button for bulk importing 2bttns data from JSON
 */

export default function TableActionsMenuItemImportJSON<T extends object>(
  props: TableActionsMenuItemImportJSON<T>
) {
  const { context } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || !acceptedFiles[0]) {
      return;
    }
    setFile(acceptedFiles[0]);
  }, []);

  const utils = api.useContext();

  const handleConfirm = async () => {
    try {
      if (!file) return;
      if (typeof window === "undefined") return;

      const fileText = await file.text();
      const base64 = window.btoa(fileText);
      const response = await apiClient.importData.importData.mutate({
        jsonBase64: base64,
      });
      await Promise.all([
        utils.tags.invalidate(),
        utils.gameObjects.invalidate(),
        utils.games.invalidate(),
      ]);
      // onClose();
    } catch (error) {
      console.error(error);
      window.alert("Error importing data. See console for details.");
    }
  };

  useEffect(() => {
    // Reset file when the menu is opened; ensures previous file is cleared
    if (context.isOpen) {
      setFile(null);
    }
  }, [context.isOpen]);

  return (
    <>
      <ConfirmAlert
        alertTitle={`Import from JSON`}
        handleConfirm={handleConfirm}
        isOpen={isOpen}
        onClose={onClose}
        performingConfirmActionText="Importing..."
        confirmButtonProps={{
          colorScheme: "blue",
          isDisabled: !file,
        }}
      >
        <Dropzone
          onDrop={onDrop}
          accept={{
            "application/json": [".json"],
          }}
        >
          {({ getRootProps, getInputProps }) => (
            <Box
              {...getRootProps()}
              borderColor="gray.300"
              borderWidth="2px"
              borderStyle="dashed"
              padding="1rem"
              textAlign="center"
              backgroundColor="gray.200"
              color="gray.500"
              cursor="pointer"
            >
              <input {...getInputProps()} />
              <Box maxWidth="256px" marginX="auto">
                <Text userSelect="none">
                  {file ? (
                    <>{file.name}</>
                  ) : (
                    <>Drag & Drop JSON file here, or click to select file</>
                  )}
                </Text>
              </Box>
            </Box>
          )}
        </Dropzone>
      </ConfirmAlert>
      <MenuItem onClick={onOpen}>Import from JSON</MenuItem>
    </>
  );
}

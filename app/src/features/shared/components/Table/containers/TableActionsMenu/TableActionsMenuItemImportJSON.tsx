import {
  Box,
  Code,
  Divider,
  FormControl,
  FormLabel,
  MenuItem,
  Switch,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { api, apiClient } from "../../../../../../utils/api";
import ConfirmAlert from "../../../ConfirmAlert";
import UnderlinedTextTooltip from "../../../UnderlinedTextTooltip";
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
  const [isImporting, setImporting] = useState<boolean>(false);

  const [allOrNothing, setAllOrNothing] = useState<boolean>(false);
  const [generateNewIds, setGenerateNewIds] = useState<boolean>(false);

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
      if (isImporting) return;
      if (typeof window === "undefined") return;

      const fileText = await file.text();
      const base64 = window.btoa(fileText);

      setImporting(true);
      await utils.importData.invalidate();
      const response = await apiClient.importData.importData.mutate({
        jsonBase64: base64,
        allOrNothing,
        generateNewIds,
      });
      await Promise.all([
        utils.tags.invalidate(),
        utils.gameObjects.invalidate(),
        utils.games.invalidate(),
      ]);

      window.alert(
        `Imported ${response.results.tags.successes} / ${response.results.tags.failures} tags, ${response.results.gameObjects.successes} /
${response.results.gameObjects.failures} game objects, and ${response.results.games.successes} / ${response.results.games.failures} games.`
      );

      const errorMessages = response.errorMessages
        ? `
=======================================
${response.errorMessages.join("\n---------------------------------------")}
=======================================`
        : "";

      if (allOrNothing && response.allOrNothingFailed) {
        throw new Error(`
All or nothing import failed.
${errorMessages}`);
      }

      if (response.errorMessages && response.errorMessages.length > 0) {
        throw new Error(
          `
Some objects failed to import. ${response.errorMessages} errors:
${errorMessages}`
        );
      }
    } catch (error) {
      console.error(error);
      window.alert("Error importing data. See console for details.");
    } finally {
      setImporting(false);
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
          isDisabled: !file || isImporting,
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

        <VStack marginTop="1rem">
          <FormControl
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <FormLabel htmlFor="allOrNothing">
              <UnderlinedTextTooltip
                tooltipProps={{
                  label: (
                    <Box sx={{ padding: "1rem" }}>
                      <Text fontWeight="bold">ALL OR NOTHING</Text>
                      <Divider mt="4px" mb="8px" />
                      <Text>
                        When set to <Code>True</Code> : If importing fails for
                        any reason, the entire import will be cancelled.
                      </Text>
                    </Box>
                  ),
                }}
              >
                All or Nothing:
              </UnderlinedTextTooltip>
            </FormLabel>
            <Switch
              id="allOrNothing"
              isChecked={allOrNothing}
              onChange={(e) => setAllOrNothing(e.target.checked)}
            />
          </FormControl>

          <FormControl
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <FormLabel htmlFor="generateNewIds">
              <UnderlinedTextTooltip
                tooltipProps={{
                  label: (
                    <Box sx={{ padding: "1rem" }}>
                      <Text fontWeight="bold">GENERATE NEW IDS</Text>
                      <Divider mt="4px" mb="8px" />
                      <Text>
                        When set to <Code>True</Code> : All imported objects
                        will have a new ID generated for them. This is useful if
                        you want to import data without risk of ID collisions.
                      </Text>
                      <br />
                      <Text>
                        However, this may result in duplicate content if you are
                        importing data that already exists in the database under
                        different IDs.
                      </Text>
                    </Box>
                  ),
                }}
              >
                Generate New IDs:
              </UnderlinedTextTooltip>
            </FormLabel>
            <Switch
              id="generateNewIds"
              isChecked={generateNewIds}
              onChange={(e) => setGenerateNewIds(e.target.checked)}
            />
          </FormControl>
        </VStack>
      </ConfirmAlert>
      <MenuItem onClick={onOpen}>Import from JSON</MenuItem>
    </>
  );
}

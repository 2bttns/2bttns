import {
  Box,
  Code,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  MenuItem,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { api, apiClient, RouterOutputs } from "../../../../../../utils/api";
import ConfirmAlert from "../../../ConfirmAlert";
import RadioCardGroup from "../../../RadioCardGroup";
import UnderlinedTextTooltip from "../../../UnderlinedTextTooltip";
import { TableActionMenuContext } from "./index";

export type TableActionsMenuItemImportJSON<T extends object> = {
  context: TableActionMenuContext<T>;
};
/**
 * Add this to the `actionItems` prop of a `TableActionMenu` to add an "Import JSON" button for bulk importing 2bttns data from JSON
 */

export enum ImportStatus {
  CLOSED = "HIDDEN",
  READY_FOR_IMPORT = "READY_FOR_IMPORT",
  IMPORTING = "IMPORTING",
  IMPORT_COMPLETE = "IMPORT_COMPLETE",
}

export default function TableActionsMenuItemImportJSON<T extends object>(
  props: TableActionsMenuItemImportJSON<T>
) {
  const { context } = props;

  const [file, setFile] = useState<File | null>(null);

  const [importStatus, setImportStatus] = useState<ImportStatus>(
    ImportStatus.CLOSED
  );

  const [importResponse, setImportResponse] = useState<
    RouterOutputs["importData"]["importData"] | null
  >(null);

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
      if (importStatus != ImportStatus.READY_FOR_IMPORT) return;
      if (typeof window === "undefined") return;

      const fileText = await file.text();
      const base64 = window.btoa(fileText);

      setImportStatus(ImportStatus.IMPORTING);
      await utils.importData.invalidate();
      const response = await apiClient.importData.importData.mutate({
        jsonBase64: base64,
        allOrNothing,
        generateNewIds,
      });
      setImportResponse(response);

      await Promise.all([
        utils.tags.invalidate(),
        utils.gameObjects.invalidate(),
        utils.games.invalidate(),
      ]);
    } catch (error) {
      console.error(error);
      window.alert("Error importing data. See console for details.");
    } finally {
      setImportStatus(ImportStatus.IMPORT_COMPLETE);
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
        isOpen={
          importStatus === ImportStatus.READY_FOR_IMPORT ||
          importStatus === ImportStatus.IMPORTING
        }
        onClose={() => {
          setImportStatus((prev) => {
            if (prev === ImportStatus.IMPORT_COMPLETE) {
              return prev;
            }
            return ImportStatus.CLOSED;
          });
        }}
        performingConfirmActionText="Importing..."
        confirmButtonProps={{
          colorScheme: "blue",
          isDisabled: !file || importStatus !== ImportStatus.READY_FOR_IMPORT,
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

      <ImportResults
        isOpen={importStatus === ImportStatus.IMPORT_COMPLETE}
        onClose={() => {
          setImportStatus(ImportStatus.CLOSED);
          setImportResponse(null);
        }}
        importResponse={importResponse}
      />
      <MenuItem
        onClick={() => {
          setImportStatus(ImportStatus.READY_FOR_IMPORT);
        }}
      >
        Import from JSON
      </MenuItem>
    </>
  );
}

type ImportResultsProps = {
  isOpen: boolean;
  onClose: () => void;
  importResponse: RouterOutputs["importData"]["importData"] | null;
};
function ImportResults(props: ImportResultsProps) {
  const { isOpen, onClose, importResponse } = props;

  type LogFilter = "All" | "Error" | "Info";
  const logFilters: LogFilter[] = ["All", "Error", "Info"];
  const [logFilter, setLogFilter] = useState<LogFilter>("All");

  const tagSuccesses = importResponse?.results.tags.successes ?? 0;
  const tagFails = importResponse?.results.tags.failures ?? 0;
  const tagTotal = tagSuccesses + tagFails;

  const gameObjectSuccesses =
    importResponse?.results.gameObjects.successes ?? 0;
  const gameObjectFails = importResponse?.results.gameObjects.failures ?? 0;
  const gameObjectTotal = gameObjectSuccesses + gameObjectFails;

  const gameSuccesses = importResponse?.results.games.successes ?? 0;
  const gameFails = importResponse?.results.games.failures ?? 0;
  const gameTotal = gameSuccesses + gameFails;

  return (
    <ConfirmAlert
      isOpen={isOpen}
      onClose={onClose}
      alertTitle=""
      handleConfirm={async () => {}}
      confirmText="Close"
      confirmButtonProps={{
        colorScheme: "blue",
      }}
      cancelButtonProps={{
        display: "none",
      }}
    >
      {importResponse && (
        <>
          <Heading size="md">Import Results</Heading>
          <Box>
            <Text as="span" fontWeight="bold">
              Tags:
            </Text>{" "}
            <Text as="span">
              {" "}
              {tagSuccesses} / {tagTotal} imported
            </Text>
          </Box>
          <Box>
            <Text as="span" fontWeight="bold">
              Game Objects:
            </Text>{" "}
            <Text as="span">
              {" "}
              {gameObjectSuccesses} / {gameObjectTotal} imported
            </Text>
          </Box>
          <Box>
            <Text as="span" fontWeight="bold">
              Games:
            </Text>{" "}
            <Text as="span">
              {" "}
              {gameSuccesses} / {gameTotal} imported
            </Text>
          </Box>

          <Heading size="sm" marginTop="1rem">
            Errors
          </Heading>
          <Box my="4px">
            <RadioCardGroup
              options={logFilters}
              optionNameOverrides={{
                All: importResponse.logMessages
                  ? `All (${importResponse.logMessages.length})`
                  : "All",
                Error: importResponse.logMessages
                  ? `Error (${
                      importResponse.logMessages.filter(
                        (m) => m.type === "error"
                      ).length
                    })`
                  : "Error",
                Info: importResponse.logMessages
                  ? `Info (${
                      importResponse.logMessages.filter(
                        (m) => m.type === "info"
                      ).length
                    })`
                  : "Info",
              }}
              useRadioGroupProps={{
                defaultValue: logFilter[0],
                onChange: (next) => setLogFilter(next as LogFilter),
                value: logFilter,
              }}
            />
          </Box>
          {importResponse.logMessages &&
          importResponse.logMessages.length > 0 ? (
            <Code maxHeight="200px" maxWidth="100%" overflow="scroll">
              {importResponse.logMessages
                ?.filter((m) => {
                  if (logFilter === "All") return true;
                  if (logFilter === "Error") return m.type === "error";
                  if (logFilter === "Info") return m.type === "info";
                  return false;
                })
                .map((m, index) => {
                  return (
                    <>
                      <Text
                        key={index}
                        color={m.type === "error" ? "red.500" : "green.500"}
                        marginTop="4px"
                      >
                        {m.message}
                      </Text>
                    </>
                  );
                })}
            </Code>
          ) : (
            <></>
          )}
        </>
      )}
    </ConfirmAlert>
  );
}

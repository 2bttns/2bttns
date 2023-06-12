import {
  Box,
  Checkbox,
  Divider,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemExportJSONContainer from "../../../shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemExportJSONContainer";
import { TagData } from "../TagsTable";

export type ExportAllTagsProps = {
  context: TableActionMenuContext<TagData>;
};

export default function ExportAllTagsJSON(props: ExportAllTagsProps) {
  const { context } = props;

  const [includeGameObjects, setIncludeGameObjects] = useState(true);

  useEffect(() => {
    // Reset the includeGameObjects state when the menu is opened
    if (context.isOpen) {
      setIncludeGameObjects(true);
    }
  }, [context]);

  return (
    <TableActionsMenuItemExportJSONContainer
      context={context}
      exportText={(countValue) => `Export All to JSON (${countValue})`}
      count={(ctx, countData) => {
        return countData?.tags ?? 0;
      }}
      exportDataQueryOptions={{
        count: "include",
        includeGames: false,
        includeGameObjects,
        includeTags: true,
        filterAllowUntaggedGameObjects: false,
      }}
      renderConfirmationAlert={(ctx, countData, countLoading) => ({
        title: "Export All Tags to JSON",
        body: (
          <Box>
            <Box>
              <Stack>
                <Checkbox
                  isChecked={includeGameObjects}
                  onChange={(e) => setIncludeGameObjects(e.target.checked)}
                >
                  Include Game Objects
                </Checkbox>
              </Stack>
              <Divider my="1rem" />
              <Text fontSize="14px">
                Click &apos;Confirm&apos; to export the following to a JSON
                file:
              </Text>
              {countLoading && <Text>Loading...</Text>}
              {!countLoading && (
                <UnorderedList mt="1rem">
                  <ListItem>
                    <strong>{countData?.tags ?? 0} tags(s) </strong>
                  </ListItem>
                  {includeGameObjects && (
                    <ListItem>
                      <strong>
                        {countData?.gameObjects ?? 0} associated game object(s)
                      </strong>
                    </ListItem>
                  )}
                </UnorderedList>
              )}
            </Box>
          </Box>
        ),
      })}
    />
  );
}

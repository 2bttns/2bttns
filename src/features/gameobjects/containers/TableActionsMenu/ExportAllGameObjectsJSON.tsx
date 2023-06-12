import {
  Box,
  Checkbox,
  Divider,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { useEffect, useState } from "react";
import { TableActionMenuContext } from "../../../shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemExportJSONContainer from "../../../shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemExportJSONContainer";
import { GameObjectData } from "../GameObjectsTable";

export type ExportAllGameObjectsJSONProps = {
  context: TableActionMenuContext<GameObjectData>;
  filteredTags?: Tag["id"][];
  filterAllowUntaggedGameObjects?: boolean;
};

export default function ExportAllGameObjectsJSON(
  props: ExportAllGameObjectsJSONProps
) {
  const {
    context,
    filteredTags,
    filterAllowUntaggedGameObjects = true,
  } = props;
  const filterTagIds = filteredTags?.join(",");

  const [includeTags, setIncludeTags] = useState(true);

  useEffect(() => {
    // Reset the includeGameObjects and includeTags state when the menu is opened
    if (context.isOpen) {
      setIncludeTags(true);
    }
  }, [context]);

  return (
    <TableActionsMenuItemExportJSONContainer
      context={context}
      exportText={(countValue) => `Export All to JSON (${countValue})`}
      count={(ctx, countData) => {
        return countData?.gameObjects ?? 0;
      }}
      exportDataQueryOptions={{
        count: "include",
        includeGames: false,
        includeGameObjects: true,
        includeTags: Boolean(filteredTags?.length) && includeTags,
        filterTagIds,
        filterAllowUntaggedGameObjects,
        filterTagsMustBeInGameObjects: true,
      }}
      renderConfirmationAlert={(ctx, countData, countLoading) => ({
        title: "Export All Game Objects to JSON",
        body: (
          <Box>
            <Box>
              <Stack>
                <Checkbox
                  isChecked={includeTags}
                  onChange={(e) => setIncludeTags(e.target.checked)}
                >
                  Include Tags
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
                    <strong>
                      {countData?.gameObjects ?? 0} game object(s){" "}
                    </strong>
                    <em>(based on applied filters)</em>
                  </ListItem>
                  {includeTags && (
                    <ListItem>
                      <strong>{countData?.tags ?? 0} associated tag(s)</strong>
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

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
import { GameData } from "../GamesTable";

export type ExportSelectedGamesJSONProps = {
  context: TableActionMenuContext<GameData>;
};

export default function ExportSelectedGamesJSON(
  props: ExportSelectedGamesJSONProps
) {
  const { context } = props;

  const [includeGameObjects, setIncludeGameObjects] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);

  useEffect(() => {
    // Reset the includeGameObjects and includeTags state when the menu is opened
    if (context.isOpen) {
      setIncludeGameObjects(true);
      setIncludeTags(true);
    }
  }, [context]);

  return (
    <TableActionsMenuItemExportJSONContainer
      context={context}
      count={(ctx, countData) => {
        return countData?.games ?? 0;
      }}
      exportText={(countValue) => `Export Selected to JSON (${countValue})`}
      exportDataQueryOptions={{
        count: "include",
        includeGames: true,
        includeGameObjects: includeGameObjects && includeTags,
        includeTags,
        filterTagsMustBeInGames: true,
        filterGameIds: context.selectedRows.map((g) => g.id).join(","),
        filterAllowUntaggedGameObjects: false,
      }}
      renderConfirmationAlert={(ctx, countData, countLoading) => ({
        title: "Export Selected Games to JSON",
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
                <Checkbox
                  isChecked={includeGameObjects && includeTags}
                  onChange={(e) => setIncludeGameObjects(e.target.checked)}
                  isDisabled={!includeTags}
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
                    <strong>{countData?.games ?? 0} game(s)</strong>{" "}
                  </ListItem>
                  {includeTags && (
                    <ListItem>
                      <strong>{countData?.tags ?? 0} associated tag(s)</strong>
                    </ListItem>
                  )}
                  {includeTags && includeGameObjects && (
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

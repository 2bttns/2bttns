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

export type ExportAllGamesProps = {
  context: TableActionMenuContext<GameData>;
};

export default function ExportAllGamesJSON(props: ExportAllGamesProps) {
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
      exportText={(countValue) => `Export All to JSON (${countValue})`}
      count={(ctx, countData) => {
        return countData?.games ?? 0;
      }}
      exportDataQueryOptions={{
        count: "include",
        includeGames: true,
        includeGameObjects: includeGameObjects && includeTags,
        includeTags,
        filterTagsMustBeInGames: true,
        filterAllowUntaggedGameObjects: false,
      }}
      renderConfirmationAlert={(ctx, countData) => ({
        title: "Export All Games to JSON",
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
              <UnorderedList mt="1rem">
                <ListItem>
                  <strong>{countData?.games ?? 0} games</strong>{" "}
                </ListItem>
                {includeTags && (
                  <ListItem>
                    <strong>{countData?.tags ?? 0} associated tags</strong>
                  </ListItem>
                )}
                {includeTags && includeGameObjects && (
                  <ListItem>
                    <strong>
                      {countData?.gameObjects ?? 0} associated game objects
                    </strong>
                  </ListItem>
                )}
              </UnorderedList>
            </Box>
          </Box>
        ),
      })}
    />
  );
}

import {
  Box,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import SecretsTable from "../../features/settings/containers/SecretsTable";

export type SettingsPage = {};

export default function SettingsPage() {
  return (
    <>
      <Heading size="2xl">Settings</Heading>
      <Box padding="1rem">
        <Tabs>
          <TabList>
            <Tab>Secrets</Tab>
            <Tab>Foo</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Box maxHeight="500px" overflow="scroll">
                <SecretsTable />
              </Box>
            </TabPanel>
            <TabPanel>
              <h2>Foo</h2>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
}

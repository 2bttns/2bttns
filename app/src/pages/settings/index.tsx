import { DeleteIcon, RepeatIcon } from "@chakra-ui/icons";
import {
  Box,
  Heading,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tooltip,
} from "@chakra-ui/react";
import { Secret } from "@prisma/client";
import { GetServerSideProps } from "next";
import { Session } from "next-auth";
import SecretsTable from "../../features/settings/containers/SecretsTable";
import { api } from "../../utils/api";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";

export type SettingsPageProps = {
  session: Session;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { session, redirect } = await getSessionWithSignInRedirect(context);

  if (!session && redirect) {
    return {
      redirect,
    };
  }

  return {
    props: {
      session,
    },
  };
};

export type SettingsPage = {};

export default function SettingsPage(props: SettingsPageProps) {
  const { session } = props;

  console.log(session);

  const utils = api.useContext();

  const updateSecretMutation = api.secrets.updateById.useMutation();
  const regenerateSecret = async (id: Secret["id"]) => {
    try {
      await updateSecretMutation.mutateAsync({
        id,
        generateNewSecret: true,
      });
      await utils.secrets.getAll.invalidate();
    } catch (error) {
      console.error(error);
      window.alert("Error regenerating secret\n See console for details");
    }
  };

  const deleteSecretMutation = api.secrets.deleteById.useMutation();
  const handleDeleteSecret = async (id: Secret["id"]) => {
    try {
      await deleteSecretMutation.mutateAsync({ id });
      await utils.secrets.invalidate();
    } catch (error) {
      console.error(error);
      window.alert("Error deleting secret\n See console for details");
    }
  };

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
                <SecretsTable
                  additionalActions={(secretData) => {
                    const { id } = secretData;
                    return (
                      <>
                        <Tooltip label={`Regenerate Secret`} placement="top">
                          <IconButton
                            colorScheme="blue"
                            onClick={() => {
                              regenerateSecret(id);
                            }}
                            icon={<RepeatIcon />}
                            aria-label={`Regenerate secret`}
                            size="sm"
                            variant="outline"
                          />
                        </Tooltip>
                        <Tooltip label={`Delete`} placement="top">
                          <IconButton
                            colorScheme="red"
                            onClick={() => {
                              handleDeleteSecret(id);
                            }}
                            icon={<DeleteIcon />}
                            aria-label={`Delete secret with ID: ${id}`}
                            size="sm"
                            variant="outline"
                          />
                        </Tooltip>
                      </>
                    );
                  }}
                />
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

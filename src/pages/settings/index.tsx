import { DeleteIcon, RepeatIcon } from "@chakra-ui/icons";
import {
  Box,
  ButtonGroup,
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
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
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

const SettingsPage: NextPage<SettingsPageProps> = (props) => {
  return (
    <>
      <Head>
        <title>Settings | 2bttns</title>
        <meta name="description" content="Settings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <>
        <Heading size="2xl">Settings</Heading>
        <Box>
          <Tabs>
            <TabList>
              <Tab>Secrets</Tab>
              <Tab>Foo</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <SecretsTable
                  additionalColumns={{
                    columns: [
                      { cell: (row) => <CellActions secretId={row.id} /> },
                    ],
                    dependencies: [],
                  }}
                />
              </TabPanel>
              <TabPanel>
                <h2>Foo</h2>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </>
    </>
  );
};

export type CellActionsProps = {
  secretId: Secret["id"];
};
function CellActions(props: CellActionsProps) {
  const { secretId } = props;
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
    <ButtonGroup width="100%" justifyContent="end">
      <Tooltip label={`Regenerate Secret`} placement="top">
        <IconButton
          colorScheme="blue"
          onClick={() => {
            regenerateSecret(secretId);
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
            handleDeleteSecret(secretId);
          }}
          icon={<DeleteIcon />}
          aria-label={`Delete secret with ID: ${secretId}`}
          size="sm"
          variant="outline"
        />
      </Tooltip>
    </ButtonGroup>
  );
}

export default SettingsPage;

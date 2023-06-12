import { DeleteIcon, RepeatIcon } from "@chakra-ui/icons";
import {
  Box,
  ButtonGroup,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { Secret } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import SecretsTable from "../../features/settings/containers/SecretsTable";
import ConfirmAlert from "../../features/shared/components/ConfirmAlert";
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

      <Box padding="1rem">
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
  );
};

export type CellActionsProps = {
  secretId: Secret["id"];
};
function CellActions(props: CellActionsProps) {
  const { secretId } = props;
  const utils = api.useContext();

  const regenerateSecretDisclosure = useDisclosure();
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

  const deleteSecretDisclosure = useDisclosure();
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
      <>
        <ConfirmAlert
          alertTitle={`Regenerate secret: ${secretId}?`}
          isOpen={regenerateSecretDisclosure.isOpen}
          onClose={regenerateSecretDisclosure.onClose}
          handleConfirm={() => regenerateSecret(secretId)}
          confirmButtonProps={{ colorScheme: "blue" }}
          performingConfirmActionText="Generating New Secret..."
        >
          Your current secret will be invalidated.
        </ConfirmAlert>
        <Tooltip label={`Regenerate Secret`} placement="top">
          <IconButton
            colorScheme="blue"
            onClick={regenerateSecretDisclosure.onOpen}
            icon={<RepeatIcon />}
            aria-label={`Regenerate secret`}
            size="sm"
            variant="outline"
          />
        </Tooltip>
      </>

      <>
        <ConfirmAlert
          alertTitle={`Delete secret: ${secretId}?`}
          isOpen={deleteSecretDisclosure.isOpen}
          onClose={deleteSecretDisclosure.onClose}
          handleConfirm={() => handleDeleteSecret(secretId)}
          performingConfirmActionText="Deleting..."
        >
          This action cannot be undone.
        </ConfirmAlert>
        <Tooltip label={`Delete`} placement="top">
          <IconButton
            colorScheme="red"
            onClick={deleteSecretDisclosure.onOpen}
            icon={<DeleteIcon />}
            aria-label={`Delete secret with ID: ${secretId}`}
            size="sm"
            variant="outline"
          />
        </Tooltip>
      </>
    </ButtonGroup>
  );
}

export default SettingsPage;

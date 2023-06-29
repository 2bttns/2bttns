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
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Secret } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import AdministratorsTable from "../../features/settings/containers/AdministratorsTable";
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
            <Tab>Administrators</Tab>
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
              <AdministratorsTable />
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
  const toast = useToast();

  const regenerateSecretDisclosure = useDisclosure();
  const updateSecretMutation = api.secrets.updateById.useMutation();
  const regenerateSecret = async (id: Secret["id"]) => {
    const regenDescription = `App ID: ${id}`;
    const regenToast = toast({
      title: "Regenerating secret...",
      status: "loading",
      description: regenDescription,
    });
    regenerateSecretDisclosure.onClose(); // Close the disclosure; toasts will notifiy the user of success/failure

    try {
      await updateSecretMutation.mutateAsync({
        id,
        generateNewSecret: true,
      });
      await utils.secrets.getAll.invalidate();
      toast.update(regenToast, {
        title: "Success: Secret regenerated",
        status: "success",
        description: regenDescription,
      });
    } catch (error) {
      console.error(error);
      toast.update(regenToast, {
        title: `Error (App ID=${id})`,
        status: "error",
        description: `Failed to regenerate secret. See console for details`,
      });
    }
  };

  const deleteSecretDisclosure = useDisclosure();
  const deleteSecretMutation = api.secrets.deleteById.useMutation();
  const handleDeleteSecret = async (id: Secret["id"]) => {
    const toastDescription = `App ID: ${id}`;
    deleteSecretDisclosure.onClose(); // Close the disclosure; toasts will notifiy the user of success/failure
    const deleteToast = toast({
      title: "Deleting secret...",
      status: "loading",
      description: toastDescription,
    });

    try {
      await deleteSecretMutation.mutateAsync({ id });
      await utils.secrets.invalidate();
      toast.update(deleteToast, {
        title: "Success: Secret deleted",
        status: "success",
        description: toastDescription,
      });
    } catch (error) {
      console.error(error);
      toast.update(deleteToast, {
        title: `Error (App ID=${id})`,
        status: "error",
        description: `Failed to delete secret. See console for details`,
      });
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
          <Text>Click &apos;Confirm&apos; to delete the following Secret:</Text>
          <Text textDecoration="underline">(App ID={secretId})</Text>
          <Text mt="1rem" color="red.500" fontStyle="italic">
            Warning: This action cannot be undone.
          </Text>
        </ConfirmAlert>
        <Tooltip label={`Delete`} placement="top">
          <IconButton
            colorScheme="red"
            onClick={deleteSecretDisclosure.onOpen}
            icon={<DeleteIcon />}
            aria-label={`Delete secret with ID=${secretId}`}
            size="sm"
            variant="outline"
          />
        </Tooltip>
      </>
    </ButtonGroup>
  );
}

export default SettingsPage;

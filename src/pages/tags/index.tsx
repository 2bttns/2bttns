import { DeleteIcon, SettingsIcon } from "@chakra-ui/icons";
import {
  Box,
  ButtonGroup,
  Heading,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import Link from "next/link";
import TagsTable from "../../features/tags/containers/TagsTable";
import { api } from "../../utils/api";
import getSessionWithSignInRedirect from "../../utils/getSessionWithSignInRedirect";

export type TagsPageProps = {
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

const TagsPage: NextPage<TagsPageProps> = (props) => {
  return (
    <>
      <Head>
        <title>Tags | 2bttns</title>
        <meta name="description" content="Tags" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <>
        <Heading size="2xl">Tags</Heading>
        <Box>
          <TagsTable
            additionalColumns={{
              columns: [{ cell: (row) => <CellActions tagId={row.id} /> }],
              dependencies: [],
            }}
          />
        </Box>
      </>
    </>
  );
};

export type CellActionsProps = {
  tagId: Tag["id"];
};
function CellActions(props: CellActionsProps) {
  const { tagId } = props;
  const utils = api.useContext();

  const deleteTagMutation = api.tags.deleteById.useMutation();
  const handleDeleteTag = async (id: Tag["id"]) => {
    try {
      await deleteTagMutation.mutateAsync({ id });
      await utils.tags.invalidate();
    } catch (error) {
      console.error(error);
      window.alert("Error deleting tag\n See console for details");
    }
  };

  return (
    <ButtonGroup width="100%" justifyContent="end">
      <Tooltip label={`Manage Tag`} placement="top">
        <Link href={`/tags/${tagId}`}>
          <IconButton
            colorScheme="blue"
            icon={<SettingsIcon />}
            aria-label={`Manage tag with ID: ${tagId}`}
            size="sm"
            variant="solid"
          />
        </Link>
      </Tooltip>
      <Tooltip label={`Delete`} placement="top">
        <IconButton
          colorScheme="red"
          onClick={() => {
            handleDeleteTag(tagId);
          }}
          icon={<DeleteIcon />}
          aria-label={`Delete tag with ID: ${tagId}`}
          size="sm"
          variant="outline"
        />
      </Tooltip>
    </ButtonGroup>
  );
}

export default TagsPage;

import { Box, ButtonGroup } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import DeleteTagButton from "../../features/tags/containers/DeleteTagButton";
import ManageTagButton from "../../features/tags/containers/ManageTagButton";
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

      <Box padding="1rem">
        <TagsTable
          additionalColumns={{
            columns: [{ cell: (row) => <CellActions tagId={row.id} /> }],
            dependencies: [],
          }}
        />
      </Box>
    </>
  );
};

export type CellActionsProps = {
  tagId: Tag["id"];
};
function CellActions(props: CellActionsProps) {
  const { tagId } = props;
  const utils = api.useContext();

  return (
    <ButtonGroup width="100%" justifyContent="end">
      <ManageTagButton tagId={tagId} />
      <DeleteTagButton tagId={tagId} />
    </ButtonGroup>
  );
}

export default TagsPage;

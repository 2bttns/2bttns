import { Box, ButtonGroup, Divider } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import TableActionMenu from "../../features/shared/components/Table/containers/TableActionsMenu";
import TableActionsMenuItemDelete from "../../features/shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemDelete";
import TableActionsMenuItemImportJSON from "../../features/shared/components/Table/containers/TableActionsMenu/TableActionsMenuItemImportJSON";
import DeleteTagButton from "../../features/tags/containers/DeleteTagButton";
import ManageTagButton from "../../features/tags/containers/ManageTagButton";
import ExportAllTagsJSON from "../../features/tags/containers/TableActionsMenu/ExportAllTagsJSON";
import ExportSelectedTagsJSON from "../../features/tags/containers/TableActionsMenu/ExportSelectedTagsJSON";
import TagsTable, { TagData } from "../../features/tags/containers/TagsTable";
import useDeleteTags from "../../features/tags/hooks/useDeleteTags";
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
          additionalTopBarContent={(selectedRows) => (
            <AdditionalTopBarContent selectedRows={selectedRows} />
          )}
        />
      </Box>
    </>
  );
};

type AdditionalTopBarContentProps = {
  selectedRows: TagData[];
};
function AdditionalTopBarContent(props: AdditionalTopBarContentProps) {
  const { selectedRows } = props;

  const { handleDeleteTag } = useDeleteTags();

  return (
    <ButtonGroup>
      <TableActionMenu
        selectedRows={selectedRows}
        actionItems={(context) => (
          <>
            <ExportSelectedTagsJSON context={context} />
            <ExportAllTagsJSON context={context} />
            <TableActionsMenuItemImportJSON context={context} />
            <Divider />
            <TableActionsMenuItemDelete
              context={context}
              handleDelete={async (selectedRows) => {
                await handleDeleteTag(selectedRows.map((row) => row.id));
              }}
              closeMenuMode="on-confirm"
            />
          </>
        )}
      />
    </ButtonGroup>
  );
}

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

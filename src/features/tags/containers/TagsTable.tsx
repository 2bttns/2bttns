import { Box, HStack, StackProps } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { api, RouterInputs, RouterOutputs } from "../../../utils/api";
import ConstrainToRemainingSpace, {
  ConstrainToRemainingSpaceProps,
} from "../../shared/components/ConstrainToRemainingSpace";
import CustomEditable from "../../shared/components/CustomEditable";
import PaginatedTable, {
  PaginatedTableProps,
} from "../../shared/components/Table/containers/PaginatedTable";
import SearchAndCreateBar from "../../shared/components/Table/containers/SearchAndCreateBar";
import usePagination from "../../shared/components/Table/hooks/usePagination";
import useSort from "../../shared/components/Table/hooks/useSort";

export type TagData = RouterOutputs["tags"]["getAll"]["tags"][0];

export type TagsTableProps = {
  onTagCreated?: (tag: TagData) => Promise<void>;
  additionalColumns?: PaginatedTableProps<TagData>["additionalColumns"];
  additionalTopBarContent?: (selectedRows: TagData[]) => React.ReactNode;
  editable?: boolean;
  constrainToRemainingSpaceProps?: Partial<ConstrainToRemainingSpaceProps>;
  topBarProps?: Partial<StackProps>;
};

export default function TagsTable(props: TagsTableProps) {
  const {
    onTagCreated,
    additionalColumns,
    additionalTopBarContent,
    editable = true,
    constrainToRemainingSpaceProps,
    topBarProps,
  } = props;

  const { perPage, currentPage, handlePageChange, handlePerRowsChange } =
    usePagination();
  const { sorting, handleSort } = useSort<TagData>();

  const utils = api.useContext();
  const [globalFilter, setGlobalFilter] = useState("");

  const tagsQuery = api.tags.getAll.useQuery(
    {
      skip: (currentPage! - 1) * perPage,
      take: perPage,
      idFilter: globalFilter,
      nameFilter: globalFilter,
      sortField: sorting?.sortField,
      sortOrder: sorting?.order,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );
  const data: TagData[] = tagsQuery.data?.tags ?? [];

  const tagsCountQuery = api.tags.getCount.useQuery(
    {
      idFilter: globalFilter,
      nameFilter: globalFilter,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const updateTagMutation = api.tags.updateById.useMutation();
  const handleUpdateTag = async (
    id: string,
    data: RouterInputs["tags"]["updateById"]["data"]
  ) => {
    try {
      await updateTagMutation.mutateAsync({ id, data });
      await utils.tags.invalidate();
    } catch (error) {
      // This will be caught by CustomEditable component using this function
      // it will revert the value to the previous value when it receives an error
      throw error;
    }
  };

  const createTagMutation = api.tags.create.useMutation();
  const handleCreateTag = async () => {
    try {
      const result = await createTagMutation.mutateAsync({
        name: globalFilter,
      });
      if (onTagCreated) await onTagCreated(result.createdTag);
      await utils.tags.invalidate();
    } catch (error) {
      window.alert("Error creating Tag\n See console for details");
      console.error(error);
    }
  };

  const columns = useMemo<PaginatedTableProps<TagData>["columns"]>(() => {
    return [
      {
        name: "ID",
        cell: (row) => (
          <CustomEditable
            value={row.id}
            placeholder="No ID"
            handleSave={async (nextValue) =>
              handleUpdateTag(row.id, {
                id: nextValue,
              })
            }
            isEditable={editable}
          />
        ),
        sortable: true,
        sortField: "id",
        minWidth: "256px",
      },
      {
        name: "Name",
        cell: (row) => (
          <CustomEditable
            value={row.name ?? undefined}
            placeholder="No name"
            handleSave={async (nextValue) =>
              handleUpdateTag(row.id, {
                name: nextValue,
              })
            }
            isEditable={editable}
          />
        ),
        sortable: true,
        sortField: "name",
        minWidth: "256px",
      },
      {
        name: "Description",
        cell: (row) => (
          <CustomEditable
            value={row.description ?? undefined}
            placeholder="No description"
            handleSave={async (nextValue) =>
              handleUpdateTag(row.id, {
                description: nextValue,
              })
            }
            isEditable={editable}
            isTextarea
          />
        ),
        sortable: true,
        sortField: "description",
        minWidth: "512px",
      },
      {
        name: "Last Updated",
        cell: (row) => row.updatedAt.toLocaleString(),
        sortable: true,
        sortField: "updatedAt",
        minWidth: "256px",
      },
    ];
  }, [editable]);

  const [selectedRows, setSelectedRows] = useState<TagData[]>([]);
  const handleSelectedRowsChange: PaginatedTableProps<TagData>["onSelectedRowsChange"] =
    (selected) => {
      setSelectedRows(selected.selectedRows);
    };

  return (
    <Box>
      <HStack spacing="4px" marginBottom="4px" width="100%" {...topBarProps}>
        <SearchAndCreateBar
          value={globalFilter}
          onChange={setGlobalFilter}
          onCreate={handleCreateTag}
        />
        {additionalTopBarContent && additionalTopBarContent(selectedRows)}
      </HStack>
      <ConstrainToRemainingSpace {...constrainToRemainingSpaceProps}>
        {(remainingHeight) => {
          return (
            <PaginatedTable<TagData>
              columns={columns}
              data={data}
              onSort={handleSort}
              additionalColumns={additionalColumns}
              loading={tagsQuery.isLoading}
              totalRows={tagsCountQuery.data?.count ?? 0}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              fixedHeight={remainingHeight}
              onSelectedRowsChange={handleSelectedRowsChange}
            />
          );
        }}
      </ConstrainToRemainingSpace>
    </Box>
  );
}

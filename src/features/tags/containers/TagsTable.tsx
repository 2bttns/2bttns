import { Box, HStack, StackProps } from "@chakra-ui/react";
import { useMemo } from "react";
import { api, RouterInputs, RouterOutputs } from "../../../utils/api";
import ConstrainToRemainingSpace, {
  ConstrainToRemainingSpaceProps,
} from "../../shared/components/ConstrainToRemainingSpace";
import CustomEditable from "../../shared/components/CustomEditable";
import PaginatedTable, {
  PaginatedTableProps,
} from "../../shared/components/Table/containers/PaginatedTable";
import SearchAndCreateBar from "../../shared/components/Table/containers/SearchAndCreateBar";
import useDebouncedValue from "../../shared/components/Table/hooks/useDebouncedValue";
import usePagination from "../../shared/components/Table/hooks/usePagination";
import useSelectRows from "../../shared/components/Table/hooks/useSelectRows";
import useSort from "../../shared/components/Table/hooks/useSort";

export type TagData = RouterOutputs["tags"]["getAll"]["tags"][0];

export type TagsTableProps = {
  additionalColumns?: PaginatedTableProps<TagData>["additionalColumns"];
  additionalTopBarContent?: (selectedRows: TagData[]) => React.ReactNode;
  allowCreate?: boolean;
  areRowsSelectable?: boolean;
  constrainToRemainingSpaceProps?: Partial<ConstrainToRemainingSpaceProps>;
  editable?: boolean;
  hideColumns?: HideTagsTableColumn;
  onTagCreated?: (tag: TagData) => Promise<void>;
  topBarProps?: Partial<StackProps>;
};

export type TagsTableColumns = "id" | "name" | "description" | "updatedAt";

export type HideTagsTableColumn = {
  [key in TagsTableColumns]?: boolean;
};

export default function TagsTable(props: TagsTableProps) {
  const {
    additionalColumns,
    additionalTopBarContent,
    allowCreate = true,
    areRowsSelectable,
    constrainToRemainingSpaceProps,
    editable = true,
    hideColumns,
    onTagCreated,
    topBarProps,
  } = props;

  const { perPage, currentPage, handlePageChange, handlePerRowsChange } =
    usePagination();
  const { sorting, handleSort } = useSort<TagData>();

  const utils = api.useContext();
  const globalFilter = useDebouncedValue();

  const tagsQuery = api.tags.getAll.useQuery(
    {
      skip: (currentPage! - 1) * perPage,
      take: perPage,
      idFilter: globalFilter.debouncedInput,
      nameFilter: globalFilter.debouncedInput,
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
      idFilter: globalFilter.debouncedInput,
      nameFilter: globalFilter.debouncedInput,
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
        name: globalFilter.debouncedInput,
      });
      if (onTagCreated) await onTagCreated(result.createdTag);
      await utils.tags.invalidate();
    } catch (error) {
      window.alert("Error creating Tag\n See console for details");
      console.error(error);
    }
  };

  const numColumnsToHide = useMemo<number>(() => {
    return Object.values(hideColumns ?? {}).filter((v) => v === true).length;
  }, [hideColumns]);

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
        omit: hideColumns?.id,
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
        omit: hideColumns?.name,
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
        omit: hideColumns?.description,
      },
      {
        name: "Last Updated",
        cell: (row) => row.updatedAt.toLocaleString(),
        sortable: true,
        sortField: "updatedAt",
        minWidth: "256px",
        omit: hideColumns?.updatedAt,
      },
    ];
  }, [editable, numColumnsToHide]);

  const { selectedRows, handleSelectedRowsChange, toggleCleared } =
    useSelectRows<TagData>({
      clearRowsUponChangeDependencies: [
        globalFilter.debouncedInput,
        perPage,
        currentPage,
      ],
    });

  return (
    <Box>
      <HStack spacing="4px" marginBottom="4px" width="100%" {...topBarProps}>
        <SearchAndCreateBar
          value={globalFilter.input}
          onChange={globalFilter.setInput}
          onCreate={allowCreate ? handleCreateTag : undefined}
        />
        {additionalTopBarContent && additionalTopBarContent(selectedRows)}
      </HStack>
      <ConstrainToRemainingSpace {...constrainToRemainingSpaceProps}>
        {(remainingHeight) => {
          return (
            <PaginatedTable<TagData>
              additionalColumns={additionalColumns}
              areRowsSelectable={areRowsSelectable}
              columns={columns}
              data={data}
              fixedHeight={remainingHeight}
              itemIdField="id"
              loading={tagsQuery.isLoading}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              onSelectedRowsChange={handleSelectedRowsChange}
              onSort={handleSort}
              selectedRows={selectedRows}
              totalRows={tagsCountQuery.data?.count ?? 0}
              toggleCleared={toggleCleared}
            />
          );
        }}
      </ConstrainToRemainingSpace>
    </Box>
  );
}

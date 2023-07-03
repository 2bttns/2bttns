import { Box, HStack, StackProps, useToast } from "@chakra-ui/react";
import { useMemo } from "react";
import { api, RouterInputs, RouterOutputs } from "../../../utils/api";
import ConstrainToRemainingSpace, {
  ConstrainToRemainingSpaceProps,
} from "../../shared/components/ConstrainToRemainingSpace";
import CustomEditable from "../../shared/components/CustomEditable";
import PaginatedTable, {
  PaginatedTableProps,
} from "../../shared/components/Table/containers/PaginatedTable";
import SearchAndCreateBar, {
  SearchAndCreateBarProps,
} from "../../shared/components/Table/containers/SearchAndCreateBar";
import useDebouncedValue from "../../shared/components/Table/hooks/useDebouncedValue";
import usePagination from "../../shared/components/Table/hooks/usePagination";
import useSelectRows from "../../shared/components/Table/hooks/useSelectRows";
import useSort from "../../shared/components/Table/hooks/useSort";

export type TagData = RouterOutputs["tags"]["getAll"]["tags"][0];

export const columnIds = {
  ID: "id",
  NAME: "name",
  DESCRIPTION: "description",
  UPDATED_AT: "updatedAt",
};

export type TagsTableProps = {
  additionalColumns?: PaginatedTableProps<TagData>["additionalColumns"];
  additionalTopBarContent?: (selectedRows: TagData[]) => React.ReactNode;
  allowCreate?: boolean;
  areRowsSelectable?: boolean;
  constrainToRemainingSpaceProps?: Partial<ConstrainToRemainingSpaceProps>;
  editable?: boolean;
  onTagCreated?: (tag: TagData) => Promise<void>;
  topBarProps?: Partial<StackProps>;
  onRowDoubleClicked?: PaginatedTableProps<TagData>["onRowDoubleClicked"];
  omitColumns?: (keyof typeof columnIds)[];
  defaultSortFieldId: PaginatedTableProps<TagData>["defaultSortFieldId"];
  defaultSortAsc: PaginatedTableProps<TagData>["defaultSortAsc"];
};

export default function TagsTable(props: TagsTableProps) {
  const {
    additionalColumns,
    additionalTopBarContent,
    allowCreate = true,
    areRowsSelectable,
    constrainToRemainingSpaceProps,
    editable = true,
    onTagCreated,
    topBarProps,
    onRowDoubleClicked,
    omitColumns,
    defaultSortFieldId,
    defaultSortAsc,
  } = props;
  const toast = useToast();

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
    const updateDescription = `ID=${id}`;
    const updateToast = toast({
      title: "Updating Tag",
      description: updateDescription,
      status: "loading",
    });
    try {
      await updateTagMutation.mutateAsync({ id, data });
      await utils.tags.invalidate();
      toast.update(updateToast, {
        title: "Success: Tag Updated",
        description: updateDescription,
        status: "success",
      });
    } catch (error) {
      toast.update(updateToast, {
        title: "Error",
        description: `Failed to update Tag (ID=${id}). See console for details`,
        status: "error",
      });
      // This will be caught by CustomEditable component using this function
      // it will revert the value to the previous value when it receives an error
      throw error;
    }
  };

  const createTagMutation = api.tags.create.useMutation();
  const handleCreateTag: SearchAndCreateBarProps["onCreate"] = async (
    value
  ) => {
    const createDescription = `Name=${value}`;
    const createToast = toast({
      title: "Creating Tag",
      description: createDescription,
      status: "loading",
    });
    try {
      const result = await createTagMutation.mutateAsync({
        name: value,
      });
      if (onTagCreated) await onTagCreated(result.createdTag);
      await utils.tags.invalidate();
      toast.update(createToast, {
        title: "Success: Tag Created",
        description: createDescription,
        status: "success",
      });
    } catch (error) {
      console.error(error);
      toast.update(createToast, {
        title: "Error",
        description: `Failed to create Tag (Name=${name}). See console for details`,
        status: "error",
      });
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
        id: columnIds["ID"],
        sortField: columnIds["ID"],
        minWidth: "256px",
        omit: omitColumns?.includes("ID"),
        reorder: true,
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
        id: columnIds.NAME,
        sortField: columnIds.NAME,
        minWidth: "256px",
        omit: omitColumns?.includes("NAME"),
        reorder: true,
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
        id: columnIds.DESCRIPTION,
        sortField: columnIds.DESCRIPTION,
        minWidth: "512px",
        omit: omitColumns?.includes("DESCRIPTION"),
        reorder: true,
      },
      {
        name: "Last Updated",
        cell: (row) => new Date(row.updatedAt).toLocaleString(),
        sortable: true,
        id: columnIds.UPDATED_AT,
        sortField: columnIds.UPDATED_AT,
        minWidth: "256px",
        omit: omitColumns?.includes("UPDATED_AT"),
        reorder: true,
      },
    ];
  }, [editable, omitColumns]);

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
              onRowDoubleClicked={onRowDoubleClicked}
              defaultSortFieldId={defaultSortFieldId}
              defaultSortAsc={defaultSortAsc}
            />
          );
        }}
      </ConstrainToRemainingSpace>
    </Box>
  );
}

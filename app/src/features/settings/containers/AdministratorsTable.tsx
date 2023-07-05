import { Box, HStack, StackProps, useToast } from "@chakra-ui/react";
import { useMemo } from "react";
import { api, RouterOutputs } from "../../../utils/api";
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

const columnIds = {
  EMAIL: "email",
  UPDATED_AT: "updatedAt",
};

export type AdminData =
  RouterOutputs["administrators"]["getAll"]["administrators"][0];

export type AdministratorsTableProps = {
  onAdminCreated?: (secret: AdminData) => Promise<void>;
  additionalColumns?: PaginatedTableProps<AdminData>["additionalColumns"];
  additionalTopBarContent?: (selectedRows: AdminData[]) => React.ReactNode;
  editable?: boolean;
  constrainToRemainingSpaceProps?: Partial<ConstrainToRemainingSpaceProps>;
  topBarProps?: Partial<StackProps>;
  areRowsSelectable?: boolean;
};

export default function AdministratorsTable(props: AdministratorsTableProps) {
  const {
    additionalColumns,
    additionalTopBarContent,
    areRowsSelectable = true,
    constrainToRemainingSpaceProps,
    editable = false,
    onAdminCreated,
    topBarProps,
  } = props;

  const toast = useToast();

  const { perPage, currentPage, handlePageChange, handlePerRowsChange } =
    usePagination();
  const { handleSort, sorting } = useSort<AdminData>();

  const utils = api.useContext();
  const globalFilter = useDebouncedValue();

  const adminQuery = api.administrators.getAll.useQuery(
    {
      skip: (currentPage! - 1) * perPage,
      take: perPage,
      allowFuzzyEmailFilter: true,
      emailFilter: globalFilter.debouncedInput,
      sortField: sorting?.sortField,
      sortOrder: sorting?.order,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );
  const data: AdminData[] = adminQuery.data?.administrators ?? [];

  const adminCountQuery = api.administrators.getCount.useQuery(
    {
      allowFuzzyEmailFilter: true,
      emailFilter: globalFilter.debouncedInput,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const columns = useMemo<PaginatedTableProps<AdminData>["columns"]>(() => {
    return [
      {
        name: "Email",
        cell: (row) => (
          <CustomEditable
            value={row.email}
            placeholder="No Email"
            handleSave={async (nextValue) => {
              // TODO: implement admin update handler
            }}
            isEditable={editable}
          />
        ),
        sortable: true,
        id: columnIds.EMAIL,
        sortField: columnIds.EMAIL,
        minWidth: "256px",
      },
      {
        name: "Last Updated",
        cell: (row) => new Date(row.updatedAt).toLocaleString(),
        sortable: true,
        id: columnIds.UPDATED_AT,
        sortField: columnIds.UPDATED_AT,
        minWidth: "256px",
      },
    ];
  }, [editable]);

  const { selectedRows, handleSelectedRowsChange, toggleCleared } =
    useSelectRows<AdminData>({
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
          // onCreate={(name) => handleCreateSecret(name)}
        />
        {additionalTopBarContent && additionalTopBarContent(selectedRows)}
      </HStack>
      <ConstrainToRemainingSpace {...constrainToRemainingSpaceProps}>
        {(remainingHeight) => {
          return (
            <PaginatedTable<AdminData>
              additionalColumns={additionalColumns}
              areRowsSelectable={areRowsSelectable}
              columns={columns}
              data={data}
              fixedHeight={remainingHeight}
              itemIdField="email"
              loading={adminQuery.isLoading}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              onSelectedRowsChange={handleSelectedRowsChange}
              onSort={handleSort}
              selectedRows={selectedRows}
              totalRows={adminCountQuery.data?.count ?? 0}
              toggleCleared={toggleCleared}
              defaultSortFieldId={columnIds.UPDATED_AT}
              defaultSortAsc={false}
            />
          );
        }}
      </ConstrainToRemainingSpace>
    </Box>
  );
}

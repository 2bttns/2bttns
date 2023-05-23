import { Box, Skeleton } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import DataTable, { IDataTableProps } from "react-data-table-component";

export type PaginatedTableProps<T> = {
  data: IDataTableProps<T>["data"];
  columns: IDataTableProps<T>["columns"];
  onSort: IDataTableProps<T>["onSort"];
  additionalColumns?: AdditionalColumns<T>;
  loading: boolean;
  totalRows: number;
  onChangePage: IDataTableProps<T>["onChangePage"];
  onChangeRowsPerPage: IDataTableProps<T>["onChangeRowsPerPage"];
  fixedHeight: IDataTableProps<T>["fixedHeaderScrollHeight"];
  onSelectedRowsChange?: IDataTableProps<T>["onSelectedRowsChange"];
};

export type AdditionalColumns<T> = {
  columns: IDataTableProps<T>["columns"];
  // The dependencies of the columns. If any of these change, the columns will be re-created.
  dependencies: any[];
};

export default function PaginatedTable<T>(props: PaginatedTableProps<T>) {
  const {
    columns,
    data,
    onSort,
    additionalColumns,
    loading,
    totalRows,
    onChangePage,
    onChangeRowsPerPage,
    fixedHeight,
    onSelectedRowsChange,
  } = props;

  const controlledColumns = useMemo<PaginatedTableProps<T>["columns"]>(() => {
    const columnsToUse = [...columns];

    if (additionalColumns) {
      columnsToUse.push(...additionalColumns.columns);
    }

    return columnsToUse;
  }, [...(additionalColumns ? additionalColumns.dependencies : [])]);

  const [progressPending, setProgressPending] = useState(false);
  useEffect(() => {
    if (loading) {
      setProgressPending(true);
    } else {
      // Delay hiding the loading indicator so that it doesn't flash when loading is fast
      setTimeout(() => setProgressPending(false), 1000);
    }
  }, [loading]);

  return (
    <Box height="100%" width="100%" overflow="scroll">
      <DataTable
        columns={controlledColumns}
        data={data}
        sortServer
        onSort={onSort}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        onChangePage={onChangePage}
        onChangeRowsPerPage={onChangeRowsPerPage}
        fixedHeader
        // Fixed table height; subtract 64px for the pagination bar
        fixedHeaderScrollHeight={`calc(${fixedHeight} - 64px - 64px)`}
        selectableRows
        onSelectedRowsChange={onSelectedRowsChange}
        paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
        customStyles={{
          cells: { style: { alignItems: "center", padding: "1rem" } },
        }}
        striped
        progressPending={progressPending}
        progressComponent={<ProgressComponent />}
      />
    </Box>
  );
}

function ProgressComponent() {
  const placeholderData = useMemo(() => new Array(10).fill({}), []);

  return (
    <DataTable
      striped
      columns={[
        {
          name: <Skeleton height="1rem" width="16px" />,
          cell: () => <Skeleton height="1rem" width="16px" />,
          grow: 0,
        },
        {
          name: (
            <Skeleton
              height="1.5rem"
              position="absolute"
              right="16px"
              left="-48px"
            />
          ),
          cell: () => (
            <Skeleton
              height="1.5rem"
              position="absolute"
              right="16px"
              left="-48px"
            />
          ),
        },
      ]}
      data={placeholderData.map((_, i) => ({}))}
    />
  );
}

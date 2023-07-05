import { Box, Skeleton } from "@chakra-ui/react";
import { intersectionBy } from "lodash";
import { useEffect, useMemo, useState } from "react";
import DataTable, { IDataTableProps } from "react-data-table-component";

export type PaginatedTableProps<T> = {
  additionalColumns?: AdditionalColumns<T>;
  areRowsSelectable?: boolean;
  columns: IDataTableProps<T>["columns"];
  data: IDataTableProps<T>["data"];
  fixedHeight: IDataTableProps<T>["fixedHeaderScrollHeight"];
  itemIdField: keyof T;
  loading: boolean;
  onChangePage: IDataTableProps<T>["onChangePage"];
  onChangeRowsPerPage: IDataTableProps<T>["onChangeRowsPerPage"];
  onSelectedRowsChange?: IDataTableProps<T>["onSelectedRowsChange"];
  onSort: IDataTableProps<T>["onSort"];
  selectedRows: T[];
  totalRows: number;
  toggleCleared?: IDataTableProps<T>["clearSelectedRows"];
  loadDelayMs?: number;
  onRowDoubleClicked?: IDataTableProps<T>["onRowDoubleClicked"];
  defaultSortFieldId?: IDataTableProps<T>["defaultSortFieldId"];
  defaultSortAsc?: IDataTableProps<T>["defaultSortAsc"];
};

export type AdditionalColumns<T> = {
  columns: IDataTableProps<T>["columns"];
  // The dependencies of the columns. If any of these change, the columns will be re-created.
  dependencies: any[];
};

export default function PaginatedTable<T>(props: PaginatedTableProps<T>) {
  const {
    additionalColumns,
    areRowsSelectable = true,
    columns,
    data,
    fixedHeight,
    itemIdField,
    loading,
    onChangePage,
    onChangeRowsPerPage,
    onSelectedRowsChange,
    onSort,
    selectedRows,
    totalRows,
    toggleCleared,
    loadDelayMs = 500,
    onRowDoubleClicked,
    defaultSortFieldId,
    defaultSortAsc,
  } = props;

  const controlledColumns = useMemo<PaginatedTableProps<T>["columns"]>(() => {
    const columnsToUse = [...columns];

    if (additionalColumns) {
      columnsToUse.push(...additionalColumns.columns);
    }

    return columnsToUse;
  }, [columns, additionalColumns]);

  const [progressPending, setProgressPending] = useState(false);
  useEffect(() => {
    if (loading) {
      setProgressPending(true);
    } else {
      // Delay hiding the loading indicator so that it doesn't flash when loading is fast
      setTimeout(() => setProgressPending(false), loadDelayMs);
    }
  }, [loading, loadDelayMs]);

  useEffect(() => {
    if (!onSelectedRowsChange) return;

    const commonElements = intersectionBy(selectedRows, data, itemIdField);
    if (commonElements.length !== selectedRows.length) {
      // If any selected rows are no longer in the data, deselect them by setting the selected rows to the intersection of the selected rows and the data,
      // which are the rows that are still in the data
      onSelectedRowsChange({
        allSelected: commonElements.length === data.length,
        selectedCount: commonElements.length,
        selectedRows: commonElements,
      });
    }
  }, [selectedRows, onSelectedRowsChange, data, itemIdField]);

  const scrollHeight = useMemo(
    () => `calc(${fixedHeight} - 64px - 64px)`,
    [fixedHeight]
  );

  return (
    <Box height="100%" width="100%" overflow="scroll">
      <DataTable
        columns={controlledColumns}
        data={data}
        sortServer
        onSort={onSort}
        defaultSortFieldId={defaultSortFieldId}
        defaultSortAsc={defaultSortAsc}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        onChangePage={onChangePage}
        onChangeRowsPerPage={onChangeRowsPerPage}
        fixedHeader
        // Fixed table height; subtract 64px for the pagination bar
        fixedHeaderScrollHeight={scrollHeight}
        selectableRows={areRowsSelectable}
        onSelectedRowsChange={onSelectedRowsChange}
        selectableRowsHighlight
        clearSelectedRows={toggleCleared}
        paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
        customStyles={{
          tableWrapper: {
            style: {
              height: scrollHeight,
            },
          },
          table: {
            style: {
              height: scrollHeight,
            },
          },
          cells: {
            style: {
              alignItems: "center",
              padding: "1rem",
              borderLeftWidth: ".5px",
              borderRightWidth: ".5px",
              borderBottomWidth: ".5px",
              borderTopWidth: "0px",
              borderColor: "rgba(200, 200, 200, .25)",
              fontSize: "12px",
            },
          },
          headCells: {
            style: {
              borderColor: "rgba(200, 200, 200, .25)",
              borderLeftWidth: ".5px",
              borderRightWidth: ".5px",
            },
          },
          pagination: {
            pageButtonsStyle: {
              borderRadius: "0",
            },
            style: {
              borderRadius: "0",
            },
          },
          rows: {
            // Make the rows look clickable if there is an onRowDoubleClicked handler
            style: onRowDoubleClicked
              ? {
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(200, 200, 200, .25)",
                  },
                  "&:active": {
                    backgroundColor: "rgba(200, 200, 200, .5)",
                  },
                }
              : undefined,
          },
        }}
        striped
        progressPending={progressPending}
        progressComponent={
          <ProgressComponent areRowsSelectable={areRowsSelectable} />
        }
        onRowDoubleClicked={onRowDoubleClicked}
      />
      {(progressPending || data.length === 0) && (
        <Box
          height="56px"
          bgColor="white"
          borderColor="rgba(0,0,0,0.12)"
          borderTopWidth="1px"
          padding="1rem"
        >
          {progressPending && (
            <Skeleton width="400px" height="100%" ml="auto" />
          )}
        </Box>
      )}
    </Box>
  );
}

type ProgressComponentProps = {
  areRowsSelectable?: boolean;
};

function ProgressComponent(props: ProgressComponentProps) {
  const { areRowsSelectable = true } = props;

  const placeholderData = useMemo(() => new Array<null>(10).fill(null), []);

  return (
    <DataTable
      striped
      columns={[
        ...[
          // Add a checkbox-looking skeleton loader to the beginning of the table if rows are selectable
          {
            name: <Skeleton height="1rem" width="16px" />,
            cell: () => <Skeleton height="1rem" width="16px" />,
            grow: 0,
          },
        ].filter(() => areRowsSelectable),
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

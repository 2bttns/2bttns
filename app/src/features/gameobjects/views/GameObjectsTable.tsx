import {
  Box,
  Button,
  ButtonGroup,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect } from "react";
import { RouterOutputs } from "../../../utils/api";

export type GameObjectData =
  RouterOutputs["gameObjects"]["getAll"]["gameObjects"][0];

export type GameObjectsTableProps = {
  gameObjects: GameObjectData[];
  columns: ColumnDef<GameObjectData, any>[];
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;

  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
};

export default function GameObjectsTable(props: GameObjectsTableProps) {
  const {
    gameObjects,
    columns,
    pageCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
  } = props;

  useEffect(() => {
    console.log(sorting);
  }, [sorting]);

  const table = useReactTable({
    data: gameObjects,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange,
    manualPagination: true,
    enableSorting: true,
    enableMultiSort: true,
    manualSorting: true,
    onSortingChange,
    debugTable: true,
  });

  return (
    <>
      <Box
        sx={{
          borderRadius: "2px",
          width: "100%",
          height: "75%",
          overflow: "auto",
        }}
      >
        <Table>
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <Box
                          sx={{
                            pointer: header.column.getCanSort()
                              ? "cursor"
                              : "default",
                          }}
                          onClick={() => {
                            if (!header.column.getCanSort()) return;
                            header.column.toggleSorting(undefined, true);
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </Box>
                      )}
                    </Th>
                  );
                })}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <Td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
          <Tfoot>
            <Tr>
              <Td>Page Rows ({table.getRowModel().rows.length})</Td>
            </Tr>
          </Tfoot>
        </Table>
      </Box>

      <Stack
        direction="row"
        sx={{
          borderRadius: "2px",
          padding: "1rem",
          height: "25%",
          width: "100%",
          justifyContent: "end",
          alignItems: "start",
        }}
      >
        <Stack direction="row" spacing="1rem" alignItems="center" width="50%">
          <ButtonGroup>
            <Button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </Button>
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </Button>
            <Select
              defaultValue={table.getState().pagination.pageIndex + 1}
              value={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                let page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              sx={{
                backgroundColor: "gray.100",
                minWidth: "150px",
              }}
            >
              {Array.from({ length: pageCount }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Page{" "}
                  <strong>
                    {i + 1} of {pageCount}
                  </strong>
                </option>
              ))}
            </Select>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </Button>
            <Button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </Button>
          </ButtonGroup>

          <Select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            sx={{
              backgroundColor: "gray.100",
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </Select>
          <Text sx={{ minWidth: "64px" }}>
            {table.getRowModel().rows.length} Rows
          </Text>
        </Stack>
      </Stack>
    </>
  );
}

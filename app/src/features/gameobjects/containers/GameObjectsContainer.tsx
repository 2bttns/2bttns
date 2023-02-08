import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  ButtonGroup,
  Input,
  InputGroup,
  InputLeftElement,
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
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { HTMLProps, useEffect, useMemo, useRef, useState } from "react";
import { api, RouterOutputs } from "../../../utils/api";

const columnHelper =
  createColumnHelper<
    RouterOutputs["gameObjects"]["getAll"]["gameObjects"][0]
  >();

const columns = [
  columnHelper.accessor("id", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("name", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("description", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("tags", {
    cell: (info) => {
      if (!info.getValue() || info.getValue().length === 0) return "No tags";
      return info
        .getValue()
        .map((tag) => tag.name)
        .join(", ");
    },
  }),
  columnHelper.accessor("createdAt", {
    cell: (info) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor("updatedAt", {
    cell: (info) => info.getValue().toLocaleString(),
  }),
];

export default function GameObjectsContainer() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { pageIndex, pageSize } = pagination;

  useEffect(() => {}, [pageIndex]);

  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const gameObjectsQuery = api.gameObjects.getAll.useQuery(
    {
      includeTags: true,
      skip: pageIndex * pageSize,
      take: pageSize,
      filter: globalFilter
        ? {
            mode: "OR",
            id: { contains: globalFilter },
            name: { contains: globalFilter },
            tag: { contains: globalFilter },
          }
        : undefined,
    },
    {
      keepPreviousData: true,
    }
  );

  const gameObjectsCountQuery = api.gameObjects.getCount.useQuery(
    {
      filter: globalFilter
        ? {
            mode: "OR",
            id: { contains: globalFilter },
            name: { contains: globalFilter },
            tag: { contains: globalFilter },
          }
        : undefined,
    },
    {
      keepPreviousData: true,
    }
  );

  const pageCount = useMemo(() => {
    if (!gameObjectsCountQuery.data) return 0;
    return Math.ceil(gameObjectsCountQuery.data.count / pageSize);
  }, [gameObjectsCountQuery.data, pagination.pageSize]);

  useEffect(() => {
    // If the page index is out of bounds, reset it to the last page
    if (pageIndex >= pageCount) {
      setPagination((prev) => ({ ...prev, pageIndex: pageCount - 1 }));
      return;
    }

    // Otherwise, if the page index is less than 0, reset it to 0
    // Only do this if the page count is greater than 0; or else, we'll get stuck in an infinite loop from the queries
    if (pageCount === 0) return;
    if (pageIndex < 0) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      return;
    }
  }, [pageCount, pageIndex]);

  const table = useReactTable({
    data: gameObjectsQuery.data?.gameObjects ?? [],
    columns,
    pageCount,
    state: {
      pagination,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    debugTable: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
  });

  return (
    <Box
      sx={{
        backgroundColor: "gray.500",
        width: "100vw",
        height: "100vh",
        padding: "1rem",
      }}
    >
      <Box
        sx={{
          backgroundColor: "gray.100",
          borderRadius: "2px",
          width: "100%",
          height: "75%",
          overflow: "auto",
        }}
      >
        <Stack direction="row" sx={{ padding: "1rem" }}>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              color="gray.300"
              fontSize="1.2em"
            >
              <SearchIcon />
            </InputLeftElement>
            <Input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by name, id, or tag"
            />
          </InputGroup>
        </Stack>
        <Table>
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
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
              <Td>
                <IndeterminateCheckbox
                  {...{
                    checked: table.getIsAllPageRowsSelected(),
                    indeterminate: table.getIsSomePageRowsSelected(),
                    onChange: table.getToggleAllPageRowsSelectedHandler(),
                  }}
                />
              </Td>
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
          {gameObjectsQuery.isFetching ? "Loading..." : null}
          <Text sx={{ minWidth: "64px" }}>
            {table.getRowModel().rows.length} Rows
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
}

function IndeterminateCheckbox(
  props: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>
) {
  const { indeterminate, ...rest } = props;
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return <input type="checkbox" ref={ref} {...rest} />;
}

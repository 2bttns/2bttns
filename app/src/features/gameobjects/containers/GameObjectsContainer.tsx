import {
  Box,
  Button,
  ButtonGroup,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
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
import { useMemo, useState } from "react";
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

  const gameObjectsQuery = api.gameObjects.getAll.useQuery(
    { includeTags: true, skip: pageIndex * pageSize, take: pageSize },
    {
      onSuccess: (data) => {
        console.log(data);
      },
      keepPreviousData: true,
    }
  );

  const gameObjectsCountQuery = api.gameObjects.getCount.useQuery();
  const pageCount = useMemo(() => {
    if (!gameObjectsCountQuery.data) return 0;
    return Math.ceil(gameObjectsCountQuery.data.count / pageSize);
  }, [gameObjectsCountQuery.data, pagination.pageSize]);

  const table = useReactTable({
    data: gameObjectsQuery.data?.gameObjects ?? [],
    columns,
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    debugTable: true,
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
        <Stack direction="row" spacing="1rem" alignItems="center">
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
          <Stack direction="row">
            <Text>
              Page{" "}
              <strong>
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </strong>
            </Text>
            <Text>Go to page:</Text>
            <Input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                let page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              sx={{ width: "64px" }}
            />
          </Stack>
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
          <div>{table.getRowModel().rows.length} Rows</div>
        </Stack>
      </Stack>
    </Box>
  );
}

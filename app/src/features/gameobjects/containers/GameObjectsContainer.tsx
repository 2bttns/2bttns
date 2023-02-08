import { Box } from "@chakra-ui/react";
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
      // keepPreviousData: true,
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
    // getPaginationRowModel: getPaginationRowModel(), // If only doing manual pagination, you don't need this
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
        }}
      >
        <div className="p-2">
          <div className="h-2" />
          <table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : (
                          <div>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="h-2" />
          <div className="flex items-center gap-2">
            <button
              className="border rounded p-1"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </button>
            <button
              className="border rounded p-1"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </button>
            <button
              className="border rounded p-1"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </button>
            <button
              className="border rounded p-1"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </button>
            <span className="flex items-center gap-1">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </strong>
            </span>
            <span className="flex items-center gap-1">
              | Go to page:
              <input
                type="number"
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="border p-1 rounded w-16"
              />
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
            {gameObjectsQuery.isFetching ? "Loading..." : null}
          </div>
          <div>{table.getRowModel().rows.length} Rows</div>
          <pre>{JSON.stringify(pagination, null, 2)}</pre>
        </div>
      </Box>
    </Box>
  );
}

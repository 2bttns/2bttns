import { Box, Button, Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
  const gameObjectsQuery = api.gameObjects.getAll.useQuery(
    { includeTags: true },
    {
      onSuccess: (data) => {
        console.log(data);
      },
    }
  );

  const table = useReactTable({
    data: gameObjectsQuery.data?.gameObjects ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rerender = () => {
    gameObjectsQuery.refetch();
  };

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
        <Table variant="striped" colorScheme="teal">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
        <div className="h-4" />
        <Button onClick={() => rerender()} className="border p-2">
          Rerender
        </Button>
      </Box>
    </Box>
  );
}

import { Box, ButtonGroup } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import {
  ColumnDef,
  createColumnHelper,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { tagFilter } from "../../../server/shared/z";
import { api, RouterInputs, RouterOutputs } from "../../../utils/api";
import TagMultiSelect, {
  TagOption,
} from "../../gameobjects/containers/TagMultiSelect";
import ConstrainToRemainingSpace from "../../shared/components/ConstrainToRemainingSpace";
import CustomEditable from "../../shared/components/CustomEditable";
import PaginatedTable from "../../shared/components/Table/containers/PaginatedTable";
import SearchAndCreateBar from "../../shared/components/Table/containers/SearchAndCreateBar";
import usePageCount from "../../shared/components/Table/hooks/usePageCount";

export type GameData = RouterOutputs["games"]["getAll"]["games"][0];

const columnHelper = createColumnHelper<GameData>();

export type GamesTableProps = {
  tag?: typeof tagFilter._type;
  onGameCreated?: (gameId: string) => Promise<void>;
  additionalActions?: (gameData: GameData) => React.ReactNode;
};

export default function GamesTable(props: GamesTableProps) {
  const { tag, onGameCreated, additionalActions } = props;

  const utils = api.useContext();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { pageIndex, pageSize } = pagination;

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const getSort = (id: keyof GameData) => {
    const result = sorting.find((s) => s.id === id);
    if (result === undefined) {
      return undefined;
    }

    return result.desc ? "desc" : "asc";
  };

  const gamesQuery = api.games.getAll.useQuery(
    {
      includeTags: true,
      skip: pageIndex * pageSize,
      take: pageSize,
      filter: globalFilter
        ? {
            mode: "OR",
            id: { contains: globalFilter },
            name: { contains: globalFilter },
            tag,
          }
        : {
            tag,
          },
      sort: {
        id: getSort("id"),
        name: getSort("name"),
        description: getSort("description"),
        inputTags: getSort("inputTags"),
        updatedAt: getSort("updatedAt"),
      },
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const gameCountQuery = api.games.getCount.useQuery(
    {
      filter: globalFilter
        ? {
            mode: "OR",
            id: { contains: globalFilter },
            name: { contains: globalFilter },
            tag,
          }
        : {
            tag,
          },
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const { pageCount } = usePageCount({
    pagination,
    setPagination,
    itemCount: gameCountQuery.data?.count ?? 0,
  });

  const updateGameMutation = api.games.updateById.useMutation();

  const handleUpdateGame = async (
    id: string,
    data: RouterInputs["games"]["updateById"]["data"]
  ) => {
    try {
      await updateGameMutation.mutateAsync({ id, data });
      await utils.games.invalidate();
    } catch (error) {
      // This will be caught by CustomEditable component using this function
      // it will revert the value to the previous value when it receives an error
      throw error;
    }
  };

  const createGameMutation = api.games.create.useMutation();
  const handleCreateGame = async (name: string) => {
    try {
      const result = await createGameMutation.mutateAsync({ name });
      if (onGameCreated) {
        await onGameCreated(result.createdGame.id);
      }
      await utils.games.invalidate();
    } catch (error) {
      window.alert("Error creating Game\n See console for details");
      console.error(error);
    }
  };

  const columns = useMemo<ColumnDef<GameData, any>[]>(() => {
    const items: ColumnDef<GameData, any>[] = [
      columnHelper.accessor("id", {
        cell: (info) => (
          <CustomEditable
            value={info.getValue()}
            placeholder="No ID"
            handleSave={async (nextValue) =>
              handleUpdateGame(info.row.original.id, {
                id: nextValue,
              })
            }
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("name", {
        cell: (info) => (
          <CustomEditable
            value={info.getValue()}
            placeholder="No name"
            handleSave={async (nextValue) =>
              handleUpdateGame(info.row.original.id, {
                name: nextValue,
              })
            }
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("description", {
        cell: (info) => (
          <CustomEditable
            value={info.getValue() ?? ""}
            placeholder="No description"
            handleSave={async (nextValue) =>
              handleUpdateGame(info.row.original.id, {
                description: nextValue,
              })
            }
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("inputTags", {
        header: "Input Tags",
        cell: (info) => {
          const tags = (info.getValue() as Tag[]) || undefined;
          const selected: TagOption[] =
            tags?.map((tag: Tag) => ({
              label: tag.name || "Untitled Tag",
              value: tag.id,
            })) || [];

          return (
            <Box width="256px">
              <TagMultiSelect
                selected={selected}
                onChange={(nextTags) => {
                  handleUpdateGame(info.row.original.id, {
                    inputTags: nextTags,
                  });
                }}
              />
            </Box>
          );
        },
        enableSorting: true,
      }),
      columnHelper.accessor("updatedAt", {
        header: "Last Updated",
        cell: (info) => info.row.original.updatedAt.toLocaleString(),
        enableSorting: true,
      }),
    ];

    if (additionalActions) {
      items.push({
        id: "actions",
        header: "",
        cell: (info) => {
          return (
            <ButtonGroup width="100%" justifyContent="end">
              {additionalActions(info.row.original)}
            </ButtonGroup>
          );
        },
      });
    }

    return items;
  }, []);

  return (
    <Box height="100%">
      <SearchAndCreateBar
        value={globalFilter}
        onChange={setGlobalFilter}
        onCreate={handleCreateGame}
      />
      <ConstrainToRemainingSpace>
        <PaginatedTable
          columns={columns}
          data={gamesQuery.data?.games ?? []}
          onPaginationChange={setPagination}
          pagination={pagination}
          pageCount={pageCount}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      </ConstrainToRemainingSpace>
    </Box>
  );
}

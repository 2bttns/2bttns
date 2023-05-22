import { Box, HStack } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { useMemo, useState } from "react";
import { tagFilter } from "../../../server/shared/z";
import { api, RouterInputs, RouterOutputs } from "../../../utils/api";
import TagMultiSelect, {
  TagOption,
} from "../../gameobjects/containers/TagMultiSelect";
import ConstrainToRemainingSpace, {
  ConstrainToRemainingSpaceProps,
} from "../../shared/components/ConstrainToRemainingSpace";
import CustomEditable from "../../shared/components/CustomEditable";
import PaginatedTable, {
  PaginatedTableProps,
} from "../../shared/components/Table/containers/PaginatedTable";
import SearchAndCreateBar from "../../shared/components/Table/containers/SearchAndCreateBar";
import usePagination from "../../shared/components/Table/hooks/usePagination";
import useSort from "../../shared/components/Table/hooks/useSort";

export type GameData = RouterOutputs["games"]["getAll"]["games"][0];

export type GamesTableProps = {
  tag?: typeof tagFilter._type;
  onGameCreated?: (gameId: string) => Promise<void>;
  additionalColumns?: PaginatedTableProps<GameData>["additionalColumns"];
  additionalTopBarContent?: React.ReactNode;
  editable?: boolean;
  constrainToRemainingSpaceProps?: Partial<ConstrainToRemainingSpaceProps>;
};

export default function GamesTable(props: GamesTableProps) {
  const {
    tag,
    onGameCreated,
    additionalColumns,
    additionalTopBarContent,
    editable = true,
    constrainToRemainingSpaceProps,
  } = props;

  const { perPage, currentPage, handlePageChange, handlePerRowsChange } =
    usePagination();
  const { getSort, handleSort } = useSort<GameData>();

  const utils = api.useContext();
  const [globalFilter, setGlobalFilter] = useState("");

  const gamesQuery = api.games.getAll.useQuery(
    {
      includeTags: true,
      skip: (currentPage! - 1) * perPage,
      take: perPage,
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
      enabled: currentPage !== null,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );
  const data: GameData[] = gamesQuery.data?.games ?? [];

  const gamesCountQuery = api.games.getCount.useQuery(
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

  const columns = useMemo<PaginatedTableProps<GameData>["columns"]>(() => {
    return [
      {
        name: "ID",
        cell: (row) => (
          <CustomEditable
            value={row.id}
            placeholder="No ID"
            handleSave={async (nextValue) =>
              handleUpdateGame(row.id, {
                id: nextValue,
              })
            }
            isEditable={editable}
          />
        ),
        sortable: true,
        sortField: "id",
        minWidth: "256px",
      },
      {
        name: "Name",
        cell: (row) => (
          <CustomEditable
            value={row.name}
            placeholder="No name"
            handleSave={async (nextValue) =>
              handleUpdateGame(row.id, {
                name: nextValue,
              })
            }
            isEditable={editable}
          />
        ),
        sortable: true,
        sortField: "name",
        minWidth: "256px",
      },
      {
        name: "Description",
        cell: (row) => (
          <CustomEditable
            value={row.description ?? undefined}
            placeholder="No description"
            handleSave={async (nextValue) =>
              handleUpdateGame(row.id, {
                description: nextValue,
              })
            }
            isEditable={editable}
            isTextarea
          />
        ),
        sortable: true,
        sortField: "description",
        minWidth: "512px",
      },
      {
        name: "Input Tags",
        cell: (row) => {
          const selected: TagOption[] =
            row.inputTags.map((tag: Tag) => ({
              label: tag.name || "Untitled Tag",
              value: tag.id,
            })) || [];

          return (
            <Box width="256px">
              <TagMultiSelect
                selected={selected}
                onChange={(nextTags) => {
                  handleUpdateGame(row.id, {
                    inputTags: nextTags,
                  });
                }}
                isEditable={editable}
              />
            </Box>
          );
        },
        sortable: true,
        sortField: "tags",
        minWidth: "256px",
      },
      {
        name: "Mode",
        cell: (row) => row.mode ?? "",
        minWidth: "128px",
      },
      {
        name: "Last Updated",
        cell: (row) => row.updatedAt.toLocaleString(),
        sortable: true,
        sortField: "updatedAt",
        minWidth: "256px",
      },
    ];
  }, [editable]);

  const [selectedRows, setSelectedRows] = useState<GameData[]>([]);
  const handleSelectedRowsChange: PaginatedTableProps<GameData>["onSelectedRowsChange"] =
    (selected) => {
      setSelectedRows(selected.selectedRows);
    };

  return (
    <Box>
      <HStack width="100%">
        <SearchAndCreateBar
          value={globalFilter}
          onChange={setGlobalFilter}
          onCreate={handleCreateGame}
        />
        {additionalTopBarContent}
      </HStack>
      <ConstrainToRemainingSpace {...constrainToRemainingSpaceProps}>
        {(remainingHeight) => {
          return (
            <PaginatedTable<GameData>
              columns={columns}
              data={data}
              onSort={handleSort}
              additionalColumns={additionalColumns}
              loading={gamesQuery.isLoading}
              totalRows={gamesCountQuery.data?.count ?? 0}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              fixedHeight={remainingHeight}
              onSelectedRowsChange={handleSelectedRowsChange}
            />
          );
        }}
      </ConstrainToRemainingSpace>
    </Box>
  );
}

import { Box, HStack, StackProps, useToast } from "@chakra-ui/react";
import { useMemo } from "react";
import { tagFilter } from "../../../server/shared/z";
import { api, RouterInputs, RouterOutputs } from "../../../utils/api";
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
import TagBadges from "../../tags/containers/TagBadges";

export type GameData = RouterOutputs["games"]["getAll"]["games"][0];

export type GamesTableProps = {
  tag?: typeof tagFilter._type;
  onGameCreated?: (gameId: string) => Promise<void>;
  additionalColumns?: PaginatedTableProps<GameData>["additionalColumns"];
  additionalTopBarContent?: (selectedRows: GameData[]) => React.ReactNode;
  editable?: boolean;
  constrainToRemainingSpaceProps?: Partial<ConstrainToRemainingSpaceProps>;
  topBarProps?: Partial<StackProps>;
  allowCreate?: boolean;
  areRowsSelectable?: boolean;
};

export default function GamesTable(props: GamesTableProps) {
  const {
    tag,
    onGameCreated,
    additionalColumns,
    additionalTopBarContent,
    editable = true,
    constrainToRemainingSpaceProps,
    topBarProps,
    allowCreate = true,
    areRowsSelectable = true,
  } = props;

  const toast = useToast();

  const { perPage, currentPage, handlePageChange, handlePerRowsChange } =
    usePagination();
  const { getSortOrder: getSort, handleSort } = useSort<GameData>();

  const utils = api.useContext();
  const globalFilter = useDebouncedValue();

  const gamesQuery = api.games.getAll.useQuery(
    {
      includeTags: true,
      skip: (currentPage! - 1) * perPage,
      take: perPage,
      filter: globalFilter.debouncedInput
        ? {
            mode: "OR",
            id: { contains: globalFilter.debouncedInput },
            name: { contains: globalFilter.debouncedInput },
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
      filter: globalFilter.debouncedInput
        ? {
            mode: "OR",
            id: { contains: globalFilter.debouncedInput },
            name: { contains: globalFilter.debouncedInput },
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
    const updateDescription = `Game ID: ${id}`;
    const updateToast = toast({
      title: "Updating Game",
      status: "loading",
      description: updateDescription,
    });
    try {
      await updateGameMutation.mutateAsync({ id, data });
      await utils.games.invalidate();
      toast.update(updateToast, {
        title: "Success: Game Updated",
        status: "success",
        description: updateDescription,
      });
    } catch (error) {
      toast.update(updateToast, {
        title: "Error",
        status: "error",
        description: `Failed to update (Game ID=${id}). See console for details`,
      });

      // This will be caught by CustomEditable component using this function
      // it will revert the value to the previous value when it receives an error
      throw error;
    }
  };

  const createGameMutation = api.games.create.useMutation();
  const handleCreateGame = async (name: string) => {
    const createToast = toast({
      title: "Creating Game",
      status: "loading",
      description: `Name: ${name}`,
    });

    try {
      const result = await createGameMutation.mutateAsync({ name });
      if (onGameCreated) {
        await onGameCreated(result.createdGame.id);
      }
      await utils.games.invalidate();
      toast.update(createToast, {
        title: "Game Created",
        status: "success",
        description: `Name: ${name}, ID: ${result.createdGame.id}`,
      });
    } catch (error) {
      console.error(error);
      toast.update(createToast, {
        title: "Error",
        status: "error",
        description: `Failed to create Game (Name=${name}). See console for details`,
      });
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
        reorder: true,
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
        reorder: true,
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
        reorder: true,
      },
      {
        name: "Input Tags",
        cell: (row) => {
          return (
            <TagBadges
              selectedTags={row.inputTags.map((t) => {
                return { id: t.id, name: t.name };
              })}
            />
          );
        },
        sortable: true,
        sortField: "tags",
        minWidth: "256px",
        reorder: true,
      },
      {
        name: "Mode",
        cell: (row) => row.mode ?? "",
        minWidth: "128px",
        reorder: true,
      },
      {
        name: "Last Updated",
        cell: (row) => row.updatedAt.toLocaleString(),
        sortable: true,
        sortField: "updatedAt",
        minWidth: "256px",
        reorder: true,
      },
    ];
  }, [editable]);

  const { selectedRows, handleSelectedRowsChange, toggleCleared } =
    useSelectRows<GameData>({
      clearRowsUponChangeDependencies: [
        globalFilter.debouncedInput,
        tag,
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
          onCreate={allowCreate ? handleCreateGame : undefined}
        />
        {additionalTopBarContent && additionalTopBarContent(selectedRows)}
      </HStack>
      <ConstrainToRemainingSpace {...constrainToRemainingSpaceProps}>
        {(remainingHeight) => {
          return (
            <PaginatedTable<GameData>
              additionalColumns={additionalColumns}
              areRowsSelectable={areRowsSelectable}
              columns={columns}
              data={data}
              fixedHeight={remainingHeight}
              itemIdField="id"
              loading={gamesQuery.isLoading}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              onSelectedRowsChange={handleSelectedRowsChange}
              onSort={handleSort}
              selectedRows={selectedRows}
              totalRows={gamesCountQuery.data?.count ?? 0}
              toggleCleared={toggleCleared}
            />
          );
        }}
      </ConstrainToRemainingSpace>
    </Box>
  );
}

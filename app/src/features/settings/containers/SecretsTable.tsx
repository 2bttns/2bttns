import { Box, Button, ButtonGroup, HStack, Text } from "@chakra-ui/react";
import {
  ColumnDef,
  createColumnHelper,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { api, RouterInputs, RouterOutputs } from "../../../utils/api";
import CustomEditable from "../../shared/components/CustomEditable";
import PaginatedTable from "../../shared/components/Table/containers/PaginatedTable";
import SearchAndCreateBar from "../../shared/components/Table/containers/SearchAndCreateBar";
import usePageCount from "../../shared/components/Table/hooks/usePageCount";

export type SecretData = RouterOutputs["secrets"]["getAll"]["secrets"][0];

const columnHelper = createColumnHelper<SecretData>();

export type SecretsTableProps = {
  additionalActions?: (secretData: SecretData) => React.ReactNode;
};

export default function SecretsTable(props: SecretsTableProps) {
  const { additionalActions } = props;

  const utils = api.useContext();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { pageIndex, pageSize } = pagination;

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const getSort = (id: keyof SecretData) => {
    const result = sorting.find((s) => s.id === id);
    if (result === undefined) {
      return undefined;
    }

    return result.desc ? "desc" : "asc";
  };

  const secretsQuery = api.secrets.getAll.useQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      filter: globalFilter
        ? {
            mode: "OR",
            id: { contains: globalFilter },
            name: { contains: globalFilter },
          }
        : undefined,
      sort: {
        id: getSort("id"),
        name: getSort("name"),
        description: getSort("description"),
        secret: getSort("secret"),
        updatedAt: getSort("updatedAt"),
      },
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const secretsCountQuery = api.secrets.getCount.useQuery(
    {
      filter: globalFilter
        ? {
            mode: "OR",
            id: { contains: globalFilter },
            name: { contains: globalFilter },
          }
        : undefined,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const { pageCount } = usePageCount({
    pagination,
    setPagination,
    itemCount: secretsCountQuery.data?.count ?? 0,
  });

  const updateSecretMutation = api.secrets.updateById.useMutation();

  const handleUpdateSecret = async (
    input: RouterInputs["secrets"]["updateById"]
  ) => {
    try {
      await updateSecretMutation.mutateAsync(input);
      await utils.secrets.invalidate();
    } catch (error) {
      // This will be caught by CustomEditable component using this function
      // it will revert the value to the previous value when it receives an error
      throw error;
    }
  };

  const createSecretMutation = api.secrets.create.useMutation();
  const handleCreateSecret = async () => {
    try {
      await createSecretMutation.mutateAsync({});
      await utils.secrets.invalidate();
    } catch (error) {
      window.alert("Error creating Secret\n See console for details");
      console.error(error);
    }
  };

  const columns = useMemo<ColumnDef<SecretData, any>[]>(() => {
    const items: ColumnDef<SecretData, any>[] = [
      columnHelper.accessor("id", {
        cell: (info) => (
          <CustomEditable
            value={info.getValue() ?? ""}
            placeholder="No ID"
            handleSave={async (nextValue) =>
              handleUpdateSecret({
                id: info.row.original.id,
                data: {
                  id: nextValue,
                },
              })
            }
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("name", {
        cell: (info) => (
          <CustomEditable
            value={info.getValue() ?? ""}
            placeholder="No name"
            handleSave={async (nextValue) =>
              handleUpdateSecret({
                id: info.row.original.id,
                data: {
                  name: nextValue,
                },
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
              handleUpdateSecret({
                id: info.row.original.id,
                data: {
                  description: nextValue,
                },
              })
            }
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("secret", {
        cell: (info) => {
          return (
            <Box>
              {/* TODO: hide the secret with a reveal ui */}
              <Text>{info.row.original.secret ?? ""}</Text>
            </Box>
          );
        },
        enableSorting: true,
      }),
      columnHelper.accessor("updatedAt", {
        header: "Last Updated",
        cell: (info) => info.getValue().toLocaleString(),
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
      <HStack width="100%">
        <SearchAndCreateBar value={globalFilter} onChange={setGlobalFilter} />
        <Button onClick={handleCreateSecret}>Create New Secret</Button>
      </HStack>
      <PaginatedTable
        columns={columns}
        data={secretsQuery.data?.secrets ?? []}
        onPaginationChange={setPagination}
        pagination={pagination}
        pageCount={pageCount}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </Box>
  );
}

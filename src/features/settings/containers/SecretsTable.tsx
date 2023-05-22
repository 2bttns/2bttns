import { Box, Button, HStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
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
import usePagination from "../../shared/components/Table/hooks/usePagination";
import useSort from "../../shared/components/Table/hooks/useSort";

export type SecretData = RouterOutputs["secrets"]["getAll"]["secrets"][0];

export type SecretsTableProps = {
  tag?: typeof tagFilter._type;
  onSecretCreated?: (secret: SecretData) => Promise<void>;
  additionalColumns?: PaginatedTableProps<SecretData>["additionalColumns"];
  additionalTopBarContent?: React.ReactNode;
  editable?: boolean;
  constrainToRemainingSpaceProps?: Partial<ConstrainToRemainingSpaceProps>;
};

export default function SecretsTable(props: SecretsTableProps) {
  const {
    onSecretCreated,
    additionalColumns,
    additionalTopBarContent,
    editable = true,
    constrainToRemainingSpaceProps,
  } = props;

  const { perPage, currentPage, handlePageChange, handlePerRowsChange } =
    usePagination();
  const { getSort, handleSort } = useSort<SecretData>();

  const utils = api.useContext();
  const [globalFilter, setGlobalFilter] = useState("");

  const secretsQuery = api.secrets.getAll.useQuery(
    {
      skip: (currentPage! - 1) * perPage,
      take: perPage,
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
  const data: SecretData[] = secretsQuery.data?.secrets ?? [];

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

  const updateSecretMutation = api.secrets.updateById.useMutation();
  const handleUpdateSecret = async (
    id: string,
    data: RouterInputs["secrets"]["updateById"]["data"]
  ) => {
    try {
      await updateSecretMutation.mutateAsync({ id, data });
      await utils.secrets.invalidate();
    } catch (error) {
      // This will be caught by CustomEditable component using this function
      // it will revert the value to the previous value when it receives an error
      throw error;
    }
  };

  const createSecretsMutation = api.secrets.create.useMutation();
  const handleCreateSecret = async () => {
    try {
      const result = await createSecretsMutation.mutateAsync({});
      if (onSecretCreated) await onSecretCreated(result.createdSecret);
      await utils.secrets.invalidate();
    } catch (error) {
      window.alert("Error creating Secret\n See console for details");
      console.error(error);
    }
  };

  const columns = useMemo<PaginatedTableProps<SecretData>["columns"]>(() => {
    return [
      {
        name: "ID",
        cell: (row) => (
          <CustomEditable
            value={row.id}
            placeholder="No ID"
            handleSave={async (nextValue) =>
              handleUpdateSecret(row.id, {
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
            value={row.name ?? undefined}
            placeholder="No name"
            handleSave={async (nextValue) =>
              handleUpdateSecret(row.id, {
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
              handleUpdateSecret(row.id, {
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
        name: "Secret",
        cell: (row) => row.secret ?? "",
        minWidth: "256px",
        sortable: true,
        sortField: "secret",
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

  const [selectedRows, setSelectedRows] = useState<SecretData[]>([]);
  const handleSelectedRowsChange: PaginatedTableProps<SecretData>["onSelectedRowsChange"] =
    (selected) => {
      setSelectedRows(selected.selectedRows);
    };

  return (
    <Box>
      <HStack width="100%">
        <SearchAndCreateBar value={globalFilter} onChange={setGlobalFilter} />
        <Button onClick={handleCreateSecret}>Create New Secret</Button>
        {additionalTopBarContent}
      </HStack>
      <ConstrainToRemainingSpace {...constrainToRemainingSpaceProps}>
        {(remainingHeight) => {
          return (
            <PaginatedTable<SecretData>
              columns={columns}
              data={data}
              onSort={handleSort}
              additionalColumns={additionalColumns}
              loading={secretsQuery.isLoading}
              totalRows={secretsCountQuery.data?.count ?? 0}
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

import { DeleteIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Table,
  Tbody,
  Td,
  Text,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { ListItem } from "@prisma/client";
import { useEffect, useState } from "react";
import EditableTd from "../../shared/components/CustomEditable/EditableTd";

// Users will be able to add fields
export type ListItemField = keyof ListItem & string;

export type ListItemsTableProps = {
  listItems: ListItem[];
  fields: ListItemField[];
  handleEditListItem: (
    item: ListItem,
    field: string,
    value: ListItem[keyof ListItem]
  ) => void;
  handleDeleteListItem: (item: ListItem) => void;
};

export default function ListItemsTable(props: ListItemsTableProps) {
  const { listItems, fields, handleEditListItem, handleDeleteListItem } = props;

  const [viewListItems, setViewListItems] = useState<ListItem[]>([]);

  useEffect(() => {
    setViewListItems(listItems);
  }, [listItems]);

  // TODO: Sort asc/desc by field
  // const sortListItems = (field: ListItemField, order: 'asc' | 'desc') => {
  //     const sortedListItems = [...viewListItems].sort((a, b) => {
  //         if (a[field] < b[field]) {
  //             return -1
  //         }
  //         if (a[field] > b[field]) {
  //             return 1
  //         }
  //         return 0
  //     })
  //     setViewListItems(sortedListItems)
  // }

  return (
    <Table variant="striped">
      <Thead
        sx={{
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          boxShadow: "0 4px 4px rgba(0, 0, 0, 0.1)",
          zIndex: 1,
        }}
      >
        <Tr>
          {fields.map((field) => (
            <Td key={field}>
              <Text
                sx={{
                  fontWeight: "bold",
                }}
              >
                {field}
              </Text>
            </Td>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {viewListItems.map((item) => {
          return (
            <Tr key={item.id}>
              {fields.map((f) => {
                const field = f as keyof ListItem;
                const value = item[field];

                const placeholder = `No ${field}`;

                return (
                  <EditableTd
                    key={`${item.id}-${field}`}
                    placeholder={placeholder}
                    value={value ? value.toString() : ""}
                    handleSave={(newValue) =>
                      handleEditListItem(item, field, newValue)
                    }
                    sx={{
                      minWidth: "400px",
                    }}
                  />
                );
              })}
              <Td>
                <IconButton
                  aria-label="Delete list item"
                  icon={<DeleteIcon />}
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => handleDeleteListItem(item)}
                />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}

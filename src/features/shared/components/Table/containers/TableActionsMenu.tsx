import { ChevronDownIcon } from "@chakra-ui/icons";
import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

export type TableActionMenuProps<T extends Object> = {
  selectedRows: T[];
};

export default function TableActionMenu<T extends Object>(
  props: TableActionMenuProps<T>
) {
  const { selectedRows } = props;
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
        Actions
      </MenuButton>
      <MenuList zIndex={99}>
        <MenuItem
          onClick={() => {
            window.alert(`Delete ${selectedRows.length} selected items?`);
          }}
        >
          Delete
        </MenuItem>
        <MenuItem>Tag</MenuItem>
        <MenuItem>Export CSV</MenuItem>
        {/* Update CsvImport function & export selected items */}
        <MenuItem>Import CSV</MenuItem>
      </MenuList>
    </Menu>
  );
}

import { ChevronDownIcon } from "@chakra-ui/icons";
import { Button, Menu, MenuButton, MenuList } from "@chakra-ui/react";
import React from "react";

export type TableActionMenuProps<T extends object> = {
  selectedRows: T[];
  actionItems: (context: TableActionMenuContext<T>) => React.ReactNode;
};

export type TableActionMenuContext<T extends object> = {
  selectedRows: TableActionMenuProps<T>["selectedRows"];
  isOpen: boolean;
  onClose: () => void;
};

export default function TableActionMenu<T extends object>(
  props: TableActionMenuProps<T>
) {
  const { selectedRows, actionItems } = props;
  return (
    <Menu>
      {({ isOpen, onClose }) => (
        <>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            Actions
          </MenuButton>
          <MenuList zIndex={99}>
            {actionItems({ selectedRows, isOpen, onClose })}
          </MenuList>
        </>
      )}
    </Menu>
  );
}

import { ChevronDownIcon } from "@chakra-ui/icons";
import { Button, Menu, MenuButton, MenuList } from "@chakra-ui/react";
import React from "react";

export type TableActionMenuProps<T extends object> = {
  selectedRows: T[];
  actionItems: (context: TableActionMenuContext<T>) => React.ReactNode;
  isDisabled?: boolean;
};

export type TableActionMenuContext<T extends object> = {
  selectedRows: TableActionMenuProps<T>["selectedRows"];
  isOpen: boolean;
  onClose: () => void;
};

export default function TableActionMenu<T extends object>(
  props: TableActionMenuProps<T>
) {
  const { selectedRows, actionItems, isDisabled = false } = props;
  return (
    <Menu>
      {({ isOpen, onClose }) => (
        <>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            isDisabled={isDisabled}
          >
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

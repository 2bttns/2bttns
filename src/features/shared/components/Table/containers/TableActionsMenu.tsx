import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useRef } from "react";

export type TableActionMenuProps<T extends Object> = {
  selectedRows: T[];
  actionItems: (context: TableActionMenuContext<T>) => React.ReactNode;
};

export type TableActionMenuContext<T extends Object> = {
  selectedRows: TableActionMenuProps<T>["selectedRows"];
};

export default function TableActionMenu<T extends Object>(
  props: TableActionMenuProps<T>
) {
  const { selectedRows, actionItems } = props;
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
        Actions
      </MenuButton>
      <MenuList zIndex={99}>
        {actionItems({ selectedRows })}
        {/* <MenuItem>Tag</MenuItem>
        <MenuItem>Export CSV</MenuItem>
        {/* Update CsvImport function & export selected items */}
        {/* <MenuItem>Import CSV</MenuItem> */}
      </MenuList>
    </Menu>
  );
}

//
//
//

export type TableActionsMenuItemDeleteProps<T extends Object> = {
  context: TableActionMenuContext<T>;
  handleDelete: (
    selectedRows: TableActionMenuProps<T>["selectedRows"]
  ) => Promise<void>;
};

export function TableActionsMenuItemDelete<T extends Object>(
  props: TableActionsMenuItemDeleteProps<T>
) {
  const { context, handleDelete } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleConfirmDelete = async () => {
    try {
      await handleDelete(context.selectedRows);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <>
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete {context.selectedRows.length} selected items?
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure? You can't undo this action afterwards.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
      <MenuItem
        onClick={onOpen}
        color="red.500"
        isDisabled={context.selectedRows.length === 0}
      >
        Delete Selected ({context.selectedRows.length})
      </MenuItem>
    </>
  );
}

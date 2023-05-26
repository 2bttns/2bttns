import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  ButtonProps,
} from "@chakra-ui/react";
import { useRef } from "react";

export type ConfirmAlertProps = {
  alertTitle: string;
  handleConfirm: () => Promise<void>;
  confirmText?: string;
  cancelText?: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  cancelButtonProps?: ButtonProps;
  confirmButtonProps?: ButtonProps;
};

export function ConfirmAlert(props: ConfirmAlertProps) {
  const {
    alertTitle,
    handleConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isOpen,
    onClose,
    children,
    cancelButtonProps,
    confirmButtonProps,
  } = props;

  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleConfirmClicked = async () => {
    await handleConfirm();
    onClose();
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
                {alertTitle}
              </AlertDialogHeader>

              <AlertDialogBody>{children}</AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={onClose}
                  {...cancelButtonProps}
                >
                  {cancelText}
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleConfirmClicked}
                  ml={3}
                  {...confirmButtonProps}
                >
                  {confirmText}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    </>
  );
}

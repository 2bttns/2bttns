import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogProps,
  Button,
  ButtonProps,
} from "@chakra-ui/react";
import { useRef, useState } from "react";

export type ConfirmAlertProps = {
  alertTitle: React.ReactNode;
  handleConfirm: () => Promise<void>;
  confirmText?: string;
  cancelText?: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  cancelButtonProps?: ButtonProps;
  confirmButtonProps?: ButtonProps;
  performingConfirmActionText?: string;
  size?: AlertDialogProps["size"];
};

export default function ConfirmAlert(props: ConfirmAlertProps) {
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
    performingConfirmActionText,
    size,
  } = props;

  const cancelRef = useRef<HTMLButtonElement>(null);

  const [isPerformingConfirmAction, setIsPerformingConfirmAction] =
    useState(false);

  const handleConfirmClicked = async () => {
    setIsPerformingConfirmAction(true);
    await handleConfirm();
    onClose();
    setIsPerformingConfirmAction(false);
  };

  return (
    <>
      <>
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
          closeOnEsc={false}
          closeOnOverlayClick={false}
          size={size}
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
                  isDisabled={isPerformingConfirmAction}
                  {...cancelButtonProps}
                >
                  {cancelText}
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleConfirmClicked}
                  ml={3}
                  isDisabled={isPerformingConfirmAction}
                  {...confirmButtonProps}
                >
                  {isPerformingConfirmAction && performingConfirmActionText
                    ? performingConfirmActionText
                    : confirmText}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    </>
  );
}

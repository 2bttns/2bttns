import {
  ButtonProps,
  IconButton,
  Tooltip,
  TooltipProps,
  useToast,
} from "@chakra-ui/react";
import { FaCopy } from "react-icons/fa";

export type CopyTextButtonProps = {
  textToCopy: string;
  tooltipLabel?: string;
  tooltipProps?: TooltipProps;
  buttonProps?: ButtonProps;
};

/**
 * Button that copies the specified text to the clipboard
 */
export default function CopyTextButton(props: CopyTextButtonProps) {
  const {
    tooltipLabel = "Copy to clipboard",
    textToCopy,
    tooltipProps,
    buttonProps,
  } = props;

  const toast = useToast();

  const handleCopy = async () => {
    toast.closeAll();
    if (!navigator.clipboard) {
      console.error("Clipboard API not available");
      toast({
        title: "Copy failed: Clipboard API not available",
        status: "error",
      });
      return;
    }
    await navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copied to clipboard",
      status: "success",
    });
  };

  return (
    <Tooltip label={tooltipLabel} placement="top" hasArrow {...tooltipProps}>
      <IconButton
        aria-label="Copy to clipboard"
        icon={<FaCopy />}
        onClick={handleCopy}
        size="sm"
        variant="ghost"
        colorScheme="blue"
        {...buttonProps}
      />
    </Tooltip>
  );
}

import { Box, Tooltip, TooltipProps } from "@chakra-ui/react";
import { useState } from "react";

export type ClickToRevealTextProps = {
  text: string;
  isRevealedTooltip?: string;
  isHiddenTooltip?: string;
  tooltipProps?: TooltipProps;
};

export default function ClickToRevealText(props: ClickToRevealTextProps) {
  const {
    text,
    isHiddenTooltip = "Click to reveal",
    isRevealedTooltip = "Click to hide",
    tooltipProps,
  } = props;
  const placeholder = "•".repeat(text.length);

  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <Tooltip
      label={isRevealed ? isRevealedTooltip : isHiddenTooltip}
      placement="top"
      hasArrow
      {...tooltipProps}
    >
      <Box
        onClick={() => setIsRevealed((prev) => !prev)}
        sx={{
          cursor: "pointer",
          userSelect: "none",
          backgroundColor: isRevealed ? "transparent" : "gray.100",
        }}
      >
        {isRevealed ? text : placeholder}
      </Box>
    </Tooltip>
  );
}

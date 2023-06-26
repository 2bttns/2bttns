import { Text, TextProps, Tooltip, TooltipProps } from "@chakra-ui/react";

export type UnderlinedTextTooltipProps = {
  children: React.ReactNode;
  textProps?: Partial<TextProps>;
  tooltipProps?: Partial<TooltipProps>;
};

export default function UnderlinedTextTooltip(
  props: UnderlinedTextTooltipProps
) {
  const { textProps, tooltipProps, children } = props;
  return (
    <Tooltip placement="top-start" {...tooltipProps}>
      <Text
        textDecorationLine="underline"
        textDecorationStyle="dotted"
        {...textProps}
      >
        {children}
      </Text>
    </Tooltip>
  );
}

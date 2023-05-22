///
/// ConstrainToRemainingSpace.tsx
/// -----------------------------
/// A component that constrains its children to the remaining space in the window.
///

import { Box, BoxProps } from "@chakra-ui/react";
import { useWindowHeight } from "@react-hook/window-size";
import { useMemo, useRef } from "react";

export type ConstrainToRemainingSpaceProps = {
  children: (remainingHeight: string) => React.ReactNode;
  bottomOffset?: number;
  boxProps?: BoxProps;
};

export default function ConstrainToRemainingSpace(
  props: ConstrainToRemainingSpaceProps
) {
  const { children, bottomOffset = 0, boxProps } = props;

  const windowHeight = useWindowHeight();
  const childComponentRef = useRef<HTMLDivElement>(null);

  const wrapperHeight = useMemo(() => {
    if (typeof window === "undefined") return 0;

    const topOfChildComponent =
      childComponentRef.current?.getBoundingClientRect().top ?? 0;

    const height = windowHeight - topOfChildComponent - bottomOffset;

    if (height < 0) return 0;
    return height;
  }, [childComponentRef.current, windowHeight, bottomOffset]);

  return (
    <Box {...boxProps} height={wrapperHeight} overflow="hidden">
      <Box ref={childComponentRef} height="100%">
        {children(`${wrapperHeight}px`)}
      </Box>
    </Box>
  );
}

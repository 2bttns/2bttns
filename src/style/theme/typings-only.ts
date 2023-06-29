import { extendTheme, Theme } from "@chakra-ui/react";
import colors from "./overrides/colors";
import components from "./overrides/components";
import radii from "./overrides/foundations/radius";
import styles from "./overrides/styles";

export type ThemeOverrides = Partial<{ [K in keyof Theme]: Partial<Theme[K]> }>;

// Base theme overrides that may have custom types that can be generated via the chakra-ui CLI
// For example, custom color tokens like `twobttns.blue`
const overrides: ThemeOverrides = {
  styles,
  radii,
  colors,
  components,

  // Do not import ./fonts.ts here; its usage of next/fonts will cause the chakra-ui CLI to not generate types properly
};

export default extendTheme(overrides);

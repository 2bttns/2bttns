import { extendTheme } from "@chakra-ui/react";
import fonts from "./overrides/fonts";
import typingsOnly from "./typings-only";

const overrides = { ...typingsOnly, fonts };
export default extendTheme(overrides);

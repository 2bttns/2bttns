import { Theme } from "@chakra-ui/react";

type ExtendedThemeColors = Partial<Theme["colors"]> & {
  [key: string]: { [key: string | number]: string };
};

const colors: ExtendedThemeColors = {
  twobttns: {
    blue: "#4d6cd2",
    darkblue: "#415db7",
    darktext: "#514e4e",
    lighttext: "#ffffff",
    green: "#68D391",
  },
};

export default colors;

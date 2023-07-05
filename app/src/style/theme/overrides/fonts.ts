import type { Theme } from "@chakra-ui/react";
import { Poppins } from "@next/font/google";
const nextFont = Poppins({
  weight: ["500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

const fonts: Theme["fonts"] = {
  body: nextFont.style.fontFamily,
  heading: nextFont.style.fontFamily,
  mono: nextFont.style.fontFamily,
};

export default fonts;

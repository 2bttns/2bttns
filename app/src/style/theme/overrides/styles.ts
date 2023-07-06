import { Theme } from "@chakra-ui/react";
import { GlobalStyleProps, mode } from "@chakra-ui/theme-tools";

const styles: Theme["styles"] = {
  global: (props: GlobalStyleProps) => ({
    body: {
      color: mode("twobttns.darktext", "twobttns.lighttext")(props),
      bg: mode("white", "gray.800")(props),
    },
  }),
};

export default styles;

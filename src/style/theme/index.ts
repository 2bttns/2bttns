import { extendTheme } from "@chakra-ui/react";

// Global style overrides
import styles from "./styles";

// Foundation overrides
import radii from "./foundations/radius";

// Component style overrides
// import Button from "./components/button";

const overrides = {
  styles,
  // Other foundational style overrides go here
  radii,
  components: {
    InputGroup: {},
  },
  colors: {
    twobttns: {
      blue: "#4d6cd2",
      darkblue: "#415db7",
      darktext: "#514e4e",
      lighttext: "#ffffff",
    },
  },
};

export default extendTheme(overrides);

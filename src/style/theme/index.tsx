// theme/index.js
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
};

export default extendTheme(overrides);

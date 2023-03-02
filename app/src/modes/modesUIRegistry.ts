import { AvailableModes } from "./availableModes";
import { classicMode } from "./classic/frontend/_index";

// Register modes here based on their identifiers
const modesUIRegistry = {
  classic: classicMode,
};

export const getModeUI = (mode: AvailableModes) => {
  if (!modesUIRegistry[mode]) throw new Error(`Mode ${mode} not found`);
  return modesUIRegistry[mode];
};

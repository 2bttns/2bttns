import { classicMode } from "./classic/frontend/_index";

// Add identifiers for all modes that you want to be available for games to use
export const availableModes = ["classic"] as const;

// Register modes here based on their identifiers
export const modesUIRegistry = {
  classic: classicMode,
};

export const getModeUI = (mode: typeof availableModes[number]) => {
  if (!modesUIRegistry[mode]) throw new Error(`Mode ${mode} not found`);
  return modesUIRegistry[mode];
};

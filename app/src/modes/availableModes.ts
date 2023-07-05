export const availableModes = [
  "classic",
  // Add mode identifiers here
] as const;

export const defaultMode = availableModes[0];

export type AvailableModes = typeof availableModes[number];

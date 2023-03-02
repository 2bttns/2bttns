import React from "react";
import { classicMode } from "./classic/_index";

export type Mode<Props extends {}> = {
  FrontendComponent: React.ComponentType<Props>;
  ConfigComponent: React.ComponentType<Props>;
  backendMiddleware: (props: Props) => unknown;
};

export const availableModes = [
  "classicMode",
  "classicModeDuplicate",
  // Add additional mode names here
] as const;

const modes: Record<typeof availableModes[number], Mode<any>> = {
  classicMode,
  classicModeDuplicate: classicMode,
  // Register additional modes here based on the AvailableModes enum
};

export default modes;

import React from "react";
import { classicMode } from "./classic/_index";

export type Mode<Props extends {}> = {
  name: string;
  FrontendComponent: React.ComponentType<Props>;
  ConfigComponent: React.ComponentType<Props>;
  backendMiddleware: (props: Props) => void | Promise<void>;
};

const modes: Mode<any>[] = [
  // Enabled modes go here
  classicMode,
];

export default modes;

/// <reference types="vitest" />

import { loadEnvConfig } from "@next/env";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(() => {
  loadEnvConfig(process.cwd());

  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
    },
  };
});

import { readFileSync, writeFileSync } from "fs";
import path from "path";

export const CONFIG_KEYS = {
  db: {
    url: "db.url",
  },
  nextAuthSecret: "nextAuthSecret",
};

export type UpdateKey = "db.url" | "nextAuthSecret";

export async function updateConfig(key: UpdateKey, value: string) {
  const pathToConfig = path.resolve(__dirname, "config", "local.json");
  const configJson = readFileSync(pathToConfig, "utf-8");
  try {
    const config = JSON.parse(configJson);
    _updateConfigRecursively(config, key, value);

    const newConfigJson = JSON.stringify(config, null, 2);
    writeFileSync(pathToConfig, newConfigJson, "utf-8");
  } catch (e) {
    console.error("Error parsing config file", e);
  }
}

/**
 *
 * @param config The config object or a nested object within it
 * @param key  The key to update -- e.g. "db.url", "url", etc.
 * @param value The value to update the key to
 */
function _updateConfigRecursively(
  config: Record<string, any>,
  key: string,
  value: string
) {
  const [firstKey, ...rest] = key.split(".");
  if (rest.length === 0) {
    config[firstKey] = value;
  } else {
    _updateConfigRecursively(config[firstKey], rest.join("."), value);
  }
}

/**
 * @returns The list of all config keys, e.g. ["db.url", "nextAuthSecret"]
 */
export function listConfigKeys() {
  const results: string[] = [];
  _findConfigKeysRecursively(CONFIG_KEYS, results);
  return results as UpdateKey[];
}

/**
 * @param currentEntry The current entry in the config keys object
 * @param results The results array that results are added to when found
 */

function _findConfigKeysRecursively(
  currentEntry: Record<string, any>,
  results: string[]
) {
  for (const key in currentEntry) {
    const subEntry = currentEntry[key];
    if (typeof subEntry === "string") {
      results.push(subEntry);
      return;
    }
    _findConfigKeysRecursively(subEntry, results);
  }
}

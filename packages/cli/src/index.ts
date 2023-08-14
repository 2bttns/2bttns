#!/usr/bin/env node
import { execSync } from "child_process";
import { Option, program } from "commander";
import type { IConfig } from "config";
import path from "path";
import { PrismaClient } from "../../../app/node_modules/@prisma/client";
import { createAdmin } from "./createAdmin";
import { CONFIG_KEYS, listConfigKeys, updateConfig } from "./updateConfig";
export type { PrismaClient };
const { version } = require("../package.json");

process.env.NODE_CONFIG_DIR = path.resolve(__dirname, "config");
const config: IConfig = require("config");
export { config };

const schemaPath = path.resolve(__dirname, "schema.prisma");
let prisma: PrismaClient;

program
  .name("@2bttns/cli")
  .description("The 2bttns command line utility")
  .version(version);
program.addOption(
  new Option("-d, --db-url <database>", "database connection url")
);

const configCommand = program.command("config");
const configGetCommand = configCommand.command("get");
const configSetCommand = configCommand.command("set");
listConfigKeys().forEach((key) => {
  const getCmd = configGetCommand.command(key);
  getCmd.action(async (name, options, command) => {
    const value = config.get(key);
    console.log(value);
  });

  const setCmd = configSetCommand.command(`${key} <value>`);
  setCmd.action(async (name, options, command) => {
    const value = command.processedArgs[0];
    if (!value) {
      console.error("<value> argument is required");
      process.exit(1);
    }
    updateConfig(key, value);
  });
});

const adminCommand = program.command("admin");
adminCommand.command("create").action(async (name, options, command) => {
  try {
    const dbUrl = options.parent.parent._optionValues.dbUrl;
    await dbConnect(dbUrl);
    await createAdmin(prisma);
  } catch (e) {
    if (e instanceof Error) console.error(e.message);
    process.exit(1);
  }
});

const dbCommand = program.command("db");
dbCommand.command("migrate").action(async (name, options, command) => {
  try {
    const dbUrl = options.parent.parent._optionValues.dbUrl;
    await dbConnect(dbUrl);
    console.info("Applying migrations...");
    execSync(`npx --yes prisma migrate deploy --schema ${schemaPath}`, {
      cwd: __dirname,
      stdio: "inherit",
    });
  } catch (e) {
    if (e instanceof Error) console.error(e.message);
    process.exit(1);
  }
});
dbCommand.command("seed").action(async (name, options, command) => {
  try {
    const dbUrl = options.parent.parent._optionValues.dbUrl;
    await dbConnect(dbUrl);
    console.log("seed DB");
  } catch (e) {
    if (e instanceof Error) console.error(e.message);
    process.exit(1);
  }
});

async function dbConnect(dbUrl: string) {
  try {
    if (typeof dbUrl === "string" && dbUrl !== "") {
      process.env.DATABASE_URL = dbUrl;
    } else if (
      config.has(CONFIG_KEYS.db.url) &&
      config.get(CONFIG_KEYS.db.url) != null
    ) {
      process.env.DATABASE_URL = config.get(CONFIG_KEYS.db.url);
    } else {
      throw new Error(
        "dbUrl is required (-d, --db-url <connection_url>). Alternatively, you can set the db.url config value (`2bttns-cli config set db.url <connection_url>`)"
      );
    }
    prisma = new PrismaClient();
    await prisma.$connect();
  } catch (e) {
    console.error("Error connecting to DB");
    if (e instanceof Error) console.error(e.message);
    process.exit(1);
  }
}

program.parse(process.argv);

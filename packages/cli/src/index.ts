#!/usr/bin/env node
import { execSync } from "child_process";
import { Option, program } from "commander";
import type { IConfig } from "config";
import path from "path";
import { PrismaClient } from "../../../app/node_modules/@prisma/client";
import {
  addOAuthEmailToAdminAllowList,
  createAdmin,
  createAdminWithCredentials,
  validateEmail,
  validateUsername,
} from "./createAdmin";
import { seed } from "./seed";
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
  new Option("-d, --db-url <value>", "Database Connection URL")
);
program.addOption(
  new Option(
    "--ignore-config",
    "Set this flag to ignore config values. This is useful if you want to use environment variables instead of config values."
  )
);

const configCommand = program.command("config");
const configGetCommand = configCommand.command("get");
const configSetCommand = configCommand.command("set");
const configClearCommand = configCommand.command("clear");
listConfigKeys().forEach((key) => {
  const getCmd = configGetCommand.command(key);
  getCmd.action(async (name, options, command) => {
    const value = config.get(key);
    console.info(value);
  });

  const setCmd = configSetCommand.command(`${key} <value>`);
  setCmd.action(async (name, options, command) => {
    const value = command.processedArgs[0];
    if (!value) {
      console.error("<value> argument is required");
      process.exit(1);
    }
    updateConfig(key, value);
    console.info(`Successfully updated config for key=${key}`);
  });

  const clearCmd = configClearCommand.command(key);
  clearCmd.action(async (name, options, command) => {
    updateConfig(key, null);
    console.info(`Cleared config for key=${key}`);
  });
});

const adminCommand = program.command("admin");
adminCommand.addOption(
  new Option(
    "-s, --secret <value>",
    "Value used for salting passwords when creating admin users with credentials. Value must match your NEXTAUTH_SECRET in your 2bttns admin console's environment variables."
  )
);
const adminCreateCommand = adminCommand
  .command("create")
  .action(async (name, options, command) => {
    try {
      const dbUrl = options.parent.parent._optionValues.dbUrl;
      const secret = options.parent._optionValues.secret;
      const ignoreConfig =
        options.parent.parent._optionValues.ignoreConfig ?? false;
      await dbConnect(dbUrl, ignoreConfig);
      await createAdmin({ prisma, secret, ignoreConfig });
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      process.exit(1);
    }
  });

const adminCreateCommandCredentials = adminCreateCommand.command("credentials");
adminCreateCommandCredentials.addOption(
  new Option("-u, --username <value>", "Username of the admin user to create")
);
adminCreateCommandCredentials.addOption(
  new Option(
    "-p, --password <value>",
    "Plain-text password of the admin user to create (will be hashed using the secret)"
  )
);
adminCreateCommandCredentials.action(async (name, options, command) => {
  try {
    const dbUrl = options.parent.parent.parent._optionValues.dbUrl;
    const ignoreConfig =
      options.parent.parent.parent._optionValues.ignoreConfig ?? false;
    const secret = options.parent.parent._optionValues.secret;

    const username = options._optionValues.username;
    const password = options._optionValues.password;

    if (!username) {
      throw new Error("Username is required (-u, --username <value>)");
    }

    if (!password) {
      throw new Error("Password is required (-p, --password <value>)");
    }

    await dbConnect(dbUrl, ignoreConfig);
    await validateUsername(prisma, username);

    await createAdminWithCredentials({
      prisma,
      username,
      password,
      secret,
      ignoreConfig,
    });
  } catch (e) {
    if (e instanceof Error) console.error(e.message);
    process.exit(1);
  }
});

const adminCreateCommandOAuth = adminCreateCommand.command("oauth-allow");
adminCreateCommandOAuth.addOption(new Option("-e, --email <value>"));
adminCreateCommandOAuth.action(async (name, options, command) => {
  try {
    const dbUrl = options.parent.parent.parent._optionValues.dbUrl;
    const ignoreConfig =
      options.parent.parent.parent._optionValues.ignoreConfig ?? false;

    const email = options._optionValues.email;
    if (!email) {
      throw new Error("Email is required (-e, --email <value>)");
    }

    await dbConnect(dbUrl, ignoreConfig);
    await validateEmail(prisma, email);
    await addOAuthEmailToAdminAllowList({ prisma, email });
  } catch (e) {
    if (e instanceof Error) console.error(e.message);
    process.exit(1);
  }
});

const dbCommand = program.command("db");
dbCommand.command("migrate").action(async (name, options, command) => {
  try {
    const dbUrl = options.parent.parent._optionValues.dbUrl;
    const ignoreConfig =
      options.parent.parent._optionValues.ignoreConfig ?? false;
    await dbConnect(dbUrl, ignoreConfig);
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
    const ignoreConfig =
      options.parent.parent._optionValues.ignoreConfig ?? false;
    await dbConnect(dbUrl, ignoreConfig);
    await seed(prisma);
  } catch (e) {
    if (e instanceof Error) console.error(e.message);
    process.exit(1);
  }
});

async function dbConnect(dbUrl: string, ignoreConfig: boolean) {
  try {
    if (typeof dbUrl === "string" && dbUrl !== "") {
      // Check for dbUrl flag
      process.env.DATABASE_URL = dbUrl;
    } else if (
      // Check config for dbUrl
      !ignoreConfig &&
      config.has(CONFIG_KEYS.db.url) &&
      config.get(CONFIG_KEYS.db.url) != null
    ) {
      process.env.DATABASE_URL = config.get(CONFIG_KEYS.db.url);
    } else if (process.env.DATABASE_URL) {
      // Check env for dbUrl
      // Do nothing, since it's already set
    } else {
      // No dbUrl found
      throw new Error(
        "dbUrl is required (-d, --db-url <connection_url>). \n\nAlternatively, you can:\n\n 1) Set the db.url config value (`2bttns-cli config set db.url <connection_url>`)\n\n 2) Set a DATABASE_URL environment variable."
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

#!/usr/bin/env node
import { Option, program } from "commander";
import { PrismaClient } from "../../../app/node_modules/@prisma/client";
import { createAdmin } from "./createAdmin";
export type { PrismaClient };

let prisma: PrismaClient;

program
  .name("@2bttns/cli")
  .description("The 2bttns command line utility")
  .version("0.0.1-alpha");
program.addOption(
  new Option("-d, --db-url <database>", "database connection url")
);

const admin = program.command("admin");
admin.command("create").action(async (name, options, command) => {
  const dbUrl = options.parent.parent._optionValues.dbUrl;
  if (!dbUrl) throw new Error("dbUrl is required (-d, --db-url <database>)");
  await dbConnect(dbUrl);
  await createAdmin(prisma);
});

const db = program.command("db");
db.command("migrate").action(async (name, options, command) => {
  const dbUrl = options.parent.parent._optionValues.dbUrl;
  if (!dbUrl) throw new Error("dbUrl is required (-d, --db-url <database>)");
  await dbConnect(dbUrl);
  console.log("migrate DB");
});
db.command("seed").action(async (name, options, command) => {
  const dbUrl = options.parent.parent._optionValues.dbUrl;
  if (!dbUrl) throw new Error("dbUrl is required (-d, --db-url <database>)");
  await dbConnect(dbUrl);
  console.log("seed DB");
});

async function dbConnect(dbUrl: string) {
  try {
    process.env.DATABASE_URL = dbUrl;
    prisma = new PrismaClient();
    await prisma.$connect();
  } catch (e) {
    console.error("Error connecting to DB");
    console.error(e);
    process.exit(1);
  }
}

program.parse(process.argv);

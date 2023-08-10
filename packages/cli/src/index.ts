#!/usr/bin/env node
import { Option, program } from "commander";
import { PrismaClient } from "../../../app/node_modules/@prisma/client";

program
  .name("@2bttns/cli")
  .description("The 2bttns command line utility")
  .version("0.0.1-alpha");

const db = program.command("db");

db.addOption(new Option("-d, --db-url <database>", "database connection url"));
db.command("migrate").action(async (name, options, command) => {
  const dbUrl = options.parent._optionValues.dbUrl;
  if (!dbUrl) throw new Error("dbUrl is required");
  process.env.DATABASE_URL = dbUrl;
  const prisma = new PrismaClient();
  await checkDbConnection(prisma);
  console.log("migrate DB");
});
db.command("seed").action(async (name, options, command) => {
  const dbUrl = options.parent._optionValues.dbUrl;
  if (!dbUrl) throw new Error("dbUrl is required");
  process.env.DATABASE_URL = dbUrl;
  const prisma = new PrismaClient();
  await checkDbConnection(prisma);
  console.log("seed DB");
});

async function checkDbConnection(prisma: PrismaClient) {
  try {
    await prisma.$connect();
  } catch (e) {
    console.error("Error connecting to DB");
    console.error(e);
    process.exit(1);
  }
}

program.parse(process.argv);

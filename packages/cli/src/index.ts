#!/usr/bin/env node
import { program } from "commander";

program
  .name("@2bttns/cli")
  .description("The 2bttns command line utility")
  .version("0.0.1-alpha");

const db = program.command("db");
db.command("migrate").action(() => {
  console.log("migrate DB");
});
db.command("seed").action(() => {
  console.log("seed DB");
});

program.parse(process.argv);

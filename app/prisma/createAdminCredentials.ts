// CLI to create admin credentials in the database
import { PrismaClient } from ".prisma/client";
const prisma = new PrismaClient();

import inquirer from "inquirer";
import readline from "readline";
import hashPassword from "../src/utils/hashPassword";
import { logger } from "../src/utils/logger";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (prompt: string) =>
  new Promise<string>((res) => rl.question(prompt, res));

main().catch((e) => {
  if (e instanceof Error) {
    logger.error(e.message);
  }
  process.exit(1);
});

async function main() {
  const { option } = await inquirer.prompt({
    type: "list",
    choices: [
      { value: 0, name: "Add Admin OAuth Email to Allow List" },
      { value: 1, name: "Create Admin Credentials using Username/Password" },
    ],
    message: "Select an option",
    name: "option",
  });

  if (option === 0) {
    return;
  }

  if (option === 1) {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret)
      throw new Error(
        "NEXTAUTH_SECRET is undefined, and is required to for hashing your password. Please set this environment variable. Aborting."
      );

    const { username } = await inquirer.prompt({
      type: "input",
      name: "username",
    });
    await validateUsername(username);

    const { password } = await inquirer.prompt({
      type: "password",
      name: "password",
    });
    const hashedPassword = hashPassword(password, secret);

    try {
      await prisma.adminCredential.create({
        data: {
          hashedPassword,
          AdminUser: {
            create: {
              id: username,
              displayName: username,
            },
          },
        },
      });
      logger.info(
        `Successfully added admin credentials for ${username} in the database.`
      );
    } catch (error) {
      console.log(error);
      throw new Error(
        `Failed to add admin credentials for ${username} in the database. An adminCredential entry already exists for this username.`
      );
    }
    return;
  }
}
async function validateUsername(username: string) {
  if (!username) throw new Error("Username cannot be empty");

  const existingUser = await prisma.adminCredential.findFirst({
    where: { username },
  });
  if (existingUser) {
    throw new Error(
      `Username ${username} already exists in the database. Aborting.`
    );
  }
  return username;
}

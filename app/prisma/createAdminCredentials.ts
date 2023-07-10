// CLI to create admin credentials in the database
import { PrismaClient } from ".prisma/client";
const prisma = new PrismaClient();

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
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is undefined. Aborting.");

  const username = await askForUsername();
  console.log("\n");
  const hashedPassword = await askForPassword(secret);

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
  } catch (error) {
    console.log(error);
    throw new Error(
      `Failed to add admin credentials for ${username} in the database. An adminCredential entry already exists for this username.`
    );
  }

  logger.info(
    `Successfully added admin credentials for ${username} in the database.`
  );
  process.exit(0);
}
async function askForUsername() {
  const username = await question("Username:\n> ");
  if (!username) throw new Error("Username cannot be empty");

  const existingUser = await prisma.adminCredential.findFirst({
    where: { username },
  });
  if (existingUser) {
    console.log("EXISTING");
    throw new Error(
      `Username ${username} already exists in the database. Aborting.`
    );
  }
  return username;
}

async function askForPassword(secret: string) {
  const password = await question(
    "Plain-Text Password (will be hashed automatically using your NextAuth secret):\n> "
  );
  if (!password) throw new Error("Password cannot be empty");
  const hashedPassword = hashPassword(password, secret);
  return hashedPassword;
}

// CLI to create admin credentials in the database
import { PrismaClient } from ".prisma/client";
const prisma = new PrismaClient();

import inquirer from "inquirer";
import { z } from "zod";
import hashPassword from "../src/utils/hashPassword";
import { logger } from "../src/utils/logger";

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

  switch (option) {
    case 0:
      await addOAuthEmailToAdminAllowList();
      break;
    case 1:
      await createAdminWithCredentials();
      break;
    default:
      throw new Error("Invalid option");
  }
}

async function addOAuthEmailToAdminAllowList() {
  const { email } = await inquirer.prompt({
    type: "input",
    name: "email",
  });
  await validateEmail(email);
  await prisma.adminOAuthAllowList.create({
    data: {
      AdminUser: {
        create: {
          id: email,
          displayName: email,
        },
      },
    },
  });

  logger.info(
    `Successfully added admin email=${email} to the allow list in the database.`
  );
}

async function createAdminWithCredentials() {
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
}

async function validateEmail(email: string) {
  if (!email) throw new Error("Email cannot be empty");
  try {
    z.string().email().parse(email);
  } catch {
    throw new Error(`Invalid email: ${email}`);
  }
  const existingAdmin = await prisma.adminOAuthAllowList.findFirst({
    where: { email },
  });
  if (existingAdmin) {
    throw new Error(
      `Admin with email=${email} already exists in the database. Aborting.`
    );
  }
  return email;
}

async function validateUsername(username: string) {
  if (!username) throw new Error("Username cannot be empty");

  const existingAdmin = await prisma.adminCredential.findFirst({
    where: { username },
  });
  if (existingAdmin) {
    throw new Error(
      `Admin with username=${username} already exists in the database. Aborting.`
    );
  }
  return username;
}

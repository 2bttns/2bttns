// Interactive CLI to create admin credentials in the database
import inquirer from "inquirer";
import { z } from "zod";
import { PrismaClient, config } from ".";
import hashPassword from "../../../app/src/utils/hashPassword";
import { CONFIG_KEYS } from "./updateConfig";

export async function createAdmin(prisma: PrismaClient) {
  await prisma.$connect();

  const { option } = await inquirer.prompt({
    type: "list",
    choices: [
      { value: 0, name: "Create Admin using Username/Password" },
      { value: 1, name: "Create Admin using Github OAuth" },
    ],
    message: "Select an option",
    name: "option",
  });

  switch (option) {
    case 0:
      await createAdminWithCredentials(prisma);
      break;
    case 1:
      await addOAuthEmailToAdminAllowList(prisma);
      break;
    default:
      throw new Error("Invalid option");
  }
}

async function addOAuthEmailToAdminAllowList(prisma: PrismaClient) {
  const { email } = await inquirer.prompt({
    type: "input",
    name: "email",
  });
  await validateEmail(prisma, email);
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

  console.info(
    `Successfully added admin email=${email} to the allow list in the database.`
  );
}

async function createAdminWithCredentials(prisma: PrismaClient) {
  if (!config.get(CONFIG_KEYS.nextAuthSecret))
    throw new Error(
      `'${CONFIG_KEYS.nextAuthSecret}' config key is required to create an admin using credentials.\n\n Set it with '2bttns-cli config set ${CONFIG_KEYS.nextAuthSecret} <value>'\n\n IMPORTANT: The value should match the NEXTAUTH_SECRET you are using in your admin console's environment variables.`
    );
  const salt = config.get(CONFIG_KEYS.nextAuthSecret) as string;
  if (!salt) {
    throw new Error(
      `Invalid ${CONFIG_KEYS.nextAuthSecret} config value. It cannot be empty.`
    );
  }

  const { username } = await inquirer.prompt({
    type: "input",
    name: "username",
  });
  await validateUsername(prisma, username);

  const { password } = await inquirer.prompt({
    type: "password",
    name: "password",
  });
  const hashedPassword = hashPassword(password, salt);

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
  console.info(
    `Successfully added admin credentials for username="${username}" in the database.`
  );
}

async function validateEmail(prisma: PrismaClient, email: string) {
  if (!email) throw new Error("Email cannot be empty");
  try {
    z.string().email().parse(email);
  } catch {
    throw new Error(`Invalid email: "${email}"`);
  }
  const existingAdmin = await prisma.adminOAuthAllowList.findFirst({
    where: { email },
  });
  if (existingAdmin) {
    throw new Error(
      `Admin with email="${email}" already exists in the database. Aborting.`
    );
  }
  return email;
}

async function validateUsername(prisma: PrismaClient, username: string) {
  if (!username) throw new Error("Username cannot be empty");

  const existingAdmin = await prisma.adminCredential.findFirst({
    where: { username },
  });
  if (existingAdmin) {
    throw new Error(
      `Admin with username="${username}" already exists in the database. Aborting.`
    );
  }
  return username;
}

// Interactive CLI to initialize a 2bttns application using Docker
import inquirer from "inquirer";
import { z } from "zod";
import { PrismaClient, config } from ".";
import hashPassword from "../../../app/src/utils/hashPassword";
import { CONFIG_KEYS } from "./updateConfig";

export async function createAdmin(params: {
  prisma: PrismaClient;
  secret: string;
  ignoreConfig: boolean;
}) {
  const { prisma, secret, ignoreConfig } = params;
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
      const { username } = await inquirer.prompt({
        type: "input",
        name: "username",
      });
      await validateUsername(prisma, username);
      const { password } = await inquirer.prompt({
        type: "password",
        name: "password",
      });
      await createAdminWithCredentials({
        prisma,
        username,
        password,
        secret,
        ignoreConfig,
      });
      break;
    case 1:
      const { email } = await inquirer.prompt({
        type: "input",
        name: "email",
      });
      await validateEmail(prisma, email);
      await addOAuthEmailToAdminAllowList({ prisma, email });
      break;
    default:
      throw new Error("Invalid option");
  }
}

export async function addOAuthEmailToAdminAllowList(params: {
  prisma: PrismaClient;
  email: string;
}) {
  const { prisma, email } = params;
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

export async function createAdminWithCredentials(params: {
  prisma: PrismaClient;
  username: string;
  password: string;
  secret: string;
  ignoreConfig: boolean;
}) {
  const { prisma, username, password, secret, ignoreConfig } = params;

  let salt: string | undefined = secret;
  if (!salt) {
    salt = config.get(CONFIG_KEYS.nextAuthSecret) as string;
    if (ignoreConfig || !salt) {
      salt = process.env.NEXTAUTH_SECRET;
    }
  }

  if (!salt)
    throw new Error(
      `A valid '${CONFIG_KEYS.nextAuthSecret}' config key is required to create an admin using credentials.
      
      Secret is required (-s, --secret <value>). 
      
      Alternatively, you can:
      
      1) Set the nextAuthSecret config value (\`2bttns-cli config set nextAuthSecret <value>\`)
      
      2) Set the NEXTAUTH_SECRET environment variable
      
      IMPORTANT: The value should match the NEXTAUTH_SECRET you are using in your admin console's environment variables.`
    );

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

export async function validateEmail(prisma: PrismaClient, email: string) {
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

export async function validateUsername(prisma: PrismaClient, username: string) {
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

// Interactive CLI to create admin credentials in the database
import inquirer from "inquirer";
import { z } from "zod";
import { PrismaClient } from ".";
import hashPassword from "../../../app/src/utils/hashPassword";

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
  const { username } = await inquirer.prompt({
    type: "input",
    name: "username",
  });
  await validateUsername(prisma, username);

  const { password } = await inquirer.prompt({
    type: "password",
    name: "password",
  });
  const { salt } = await inquirer.prompt({
    type: "password",
    name: "salt",
    message:
      "Password salt should match your NEXTAUTH_SECRET environment variable.",
  });
  if (!salt) throw new Error("Salt cannot be empty");

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
    `Successfully added admin credentials for ${username} in the database.`
  );
}

async function validateEmail(prisma: PrismaClient, email: string) {
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

async function validateUsername(prisma: PrismaClient, username: string) {
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

// Interactive CLI to create admin credentials in the database
import { execSync } from "child_process";
import inquirer from "inquirer";
import {
  EnvironmentVars,
  buildDockerComposeFile,
} from "./buildDockerComposeFile";
import fs from "fs";
import path from "path";
import { sleep } from "../utils/sleep";

type InstallParams = {
  dryRun?: boolean;
};
export async function install({ dryRun = false }: InstallParams) {
  const defaultComposeFIleName = "docker-compose.yaml";
  const composeFilePath = path.join(process.cwd(), defaultComposeFIleName);
  if (fs.existsSync(composeFilePath)) {
    throw new Error(`${composeFilePath} already exists. Aborting.`);
  }

  console.log("=====================================");
  console.log("Welcome to the 2bttns install wizard!");
  console.log("=====================================\n");

  if (dryRun) {
    console.log("dry run:", dryRun);
  }

  let dockerComposeCmd: string | null = null;
  if (!dryRun) {
    dockerComposeCmd = checkDockerComposeInstallation();
    if (dockerComposeCmd !== null) {
      console.log(`Found Docker Compose installation: ${dockerComposeCmd}\n`);
    } else {
      throw new Error(
        "Docker Compose not found. Please ensure Docker Compose is available on your $PATH."
      );
    }
  }

  const envVars: EnvironmentVars = {};

  const { dbUrl } = await inquirer.prompt({
    type: "input",
    message: `DATABASE_URL (optional)
    
Must be a valid PostgreSQL URL in the following format: postgresql://dev-user:dev-pass@localhost:5433/dev-db
    
If empty, the Docker Compose file will be configured with a sample PostgreSQL container.",

>`,
    name: "dbUrl",
  });
  if ((dbUrl as string).trim() !== "") {
    envVars.DATABASE_URL = dbUrl;
  } else {
    console.log(
      "received empty DATABASE_URL. A sample PostgreSQL container will be configured for your 2bttns Docker Compose file.\n\n"
    );
  }

  const { nextAuthSecret } = await inquirer.prompt({
    type: "input",
    message: `NEXTAUTH_SECRET (optional)
    
If empty, a secret will be generated for you.

>`,
    name: "nextAuthSecret",
  });
  if ((nextAuthSecret as string).trim() !== "") {
    envVars.NEXTAUTH_SECRET = dbUrl;
  } else {
    console.log(
      "received empty NEXTAUTH_SECRET. A secret will be automatically generated for your 2bttns Docker Compose file.\n\n"
    );
  }

  const { githubAuth } = await inquirer.prompt({
    type: "confirm",
    message: "Enable GitHub OAuth?",
    name: "githubAuth",
  });

  if (githubAuth) {
    const { githubId } = await inquirer.prompt({
      type: "input",
      message: "GITHUB_ID:",
      name: "githubId",
    });
    const { githubSecret } = await inquirer.prompt({
      type: "input",
      message: "GITHUB_SECRET:",
      name: "githubSecret",
    });

    envVars.GITHUB_ID = githubId;
    envVars.GITHUB_SECRET = githubSecret;
  }
  const composeFile = buildDockerComposeFile(envVars);

  if (dryRun) {
    console.log(
      "--dry-run was specified: skipping creation and running of the compose file\n\n"
    );
    console.log(composeFile);
    return;
  }

  try {
    fs.writeFileSync(composeFilePath, composeFile, "utf-8");
  } catch (e) {
    throw new Error(`failed to create Docker Compose file: ${e}`);
  }
  console.log(`created ${defaultComposeFIleName}`);

  try {
    execSync(`${dockerComposeCmd} up -d`);
    await sleep(1000);
  } catch (e) {
    throw new Error(`\`${dockerComposeCmd} up\` failed: ${e}`);
  }

  try {
    execSync(`docker container exec 2bttns 2bttns-cli db migrate`);
    console.log("db migrate operation succeeded");
  } catch (e) {
    throw new Error(`2bttns db migrate command failed: ${e}`);
  }

  try {
    execSync(`docker container exec 2bttns 2bttns-cli db seed`);
    console.log("db seed operation succeeded");
  } catch (e) {
    throw new Error(`2bttns db seed command failed: ${e}`);
  }

  try {
    const result = execSync(`${dockerComposeCmd} port twobttns 3262`);
    console.log(`Your 2bttns instance is now running at ${result.toString()}`);
  } catch (e) {
    throw new Error(`2bttns instance is not running: ${e}`);
  }

  console.log(
    "\n\nTo log in to your 2bttns console, you'll need to create an admin user account."
  );
  console.log(
    `You can do this by running \`${dockerComposeCmd} exec twobttns 2bttns-cli admin create\``
  );
}

function checkDockerComposeInstallation():
  | "docker compose"
  | "docker-compose"
  | null {
  try {
    execSync("docker version");
  } catch {
    return null;
  }

  try {
    execSync("docker compose version");
    return "docker compose";
  } catch {}

  try {
    execSync("docker-compose version");
    return "docker-compose";
  } catch {}

  return null;
}

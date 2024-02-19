import YAML from "yaml";
import crypto from "crypto";

export const SAMPLE_DB_URL =
  "postgresql://username:password@db-hostname:5432/db";

// External references to the sample DB should use localhost
// e.g. creating an admin against 'db-hostname' from outside the container won't work. You should use localhost instead.
export const SAMPLE_DB_URL_EXTERNAL =
  "postgresql://username:password@localhost:5432/db";

export type EnvironmentVars = {
  DATABASE_URL?: string;
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
  GITHUB_ID?: string;
  GITHUB_SECRET?: string;
  SERVER_LOG_LEVEL?: string;
  SERVER_LOG_LOCALE?: string;
};

export function buildDockerComposeFile(environment: EnvironmentVars): string {
  const composeFile = YAML.parse(`
version: "3.9"
name: 2bttns-docker-compose
services:
  twobttns:
    image: 2bttns/2bttns
    container_name: 2bttns
    ports:
      - "3262:3262"
`);
  composeFile.services.twobttns.environment = environment;

  const usingSampleDb = environment.DATABASE_URL === undefined;
  if (usingSampleDb) {
    composeFile.services.twobttns.environment.DATABASE_URL =
      "postgresql://username:password@db-hostname:5432/db";
    composeFile.services.twobttns.depends_on = ["db"];

    composeFile.services.db = YAML.parse(`
    image: postgres:13
    container_name: db-hostname
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: username
      POSTGRES_PASSWORD: password
      POSTGRES_DB: db
    volumes:
      - db-data:/var/lib/postgresql/data
    `);

    composeFile.volumes = {
      "db-data": null,
    };
  }

  if (environment.NEXTAUTH_SECRET === undefined) {
    composeFile.services.twobttns.environment.NEXTAUTH_SECRET = crypto
      .randomBytes(32)
      .toString("hex");
  }

  return YAML.stringify(composeFile);
}

# 2bttns

<a href="https://2bttns.com" target="_blank"><img src="https://img.shields.io/badge/official site-2bttns.com-green.svg?style=for-the-badge"></a>
<a href="https://docs.2bttns.com/docs/intro" target="_blank"><img src="https://img.shields.io/badge/docs-v0.0.1_alpha-green.svg?style=for-the-badge"></a>
<a href="https://hub.docker.com/r/2bttns/2bttns" target="_blank"><img src="https://img.shields.io/badge/docker hub-2bttns/2bttns-blue.svg?logo=docker&style=for-the-badge"></a>
<a href="https://discord.com/invite/YkjQNyhmsT" target="_blank"><img src="https://img.shields.io/badge/chat-discord-yellow.svg?logo=discord&style=for-the-badge"></a>

## Quickstart

### For Windows Users:

> If you are on macOS or Linux, you can skip this step.

In order to run the scripts on Windows, you will need to have Docker Desktop installed and configured with the WSL 2 backend.

You can find the instructions to do so here: : https://docs.docker.com/desktop/wsl.

Be sure to run the following commands in a WSL terminal, which you can start by calling `wsl.exe` in your Windows Command Prompt / PowerShell.

### Installation Scripts

We've provided a few scripts to help you get started quickly with 2bttns. Feel free to customize them to your needs.

#### i. via Docker Compose

> For additional information, see https://github.com/2bttns/2bttns/blob/dockerize/install/docker-compose.

```sh
# Download the docker-compose.yml file to your current working directory
curl https://raw.githubusercontent.com/2bttns/2bttns/dockerize/install/docker-compose/docker-compose.yml -o docker-compose.yml

# Run the `init.sh` script
curl -s https://raw.githubusercontent.com/2bttns/2bttns/dockerize/install/docker-compose/init.sh | sh -s

```

#### ii. via Docker in the Command Line

> For additional information, see https://github.com/2bttns/2bttns/blob/dockerize/install/docker-run

```sh
# Creates a 2bttns admin console Docker container that uses a PostgreSQL database container
curl -s https://raw.githubusercontent.com/2bttns/2bttns/dockerize/install/docker-run/docker-run.sh | sh -s
```

### Create Admin Users

You can use the [2bttns-cli](https://www.npmjs.com/package/@2bttns/2bttns-cli) to create a new admin user.

#### From your 2bttns admin console container

The [2bttns/2bttns](https://hub.docker.com/r/2bttns/2bttns) Docker image comes with the 2bttns CLI pre-installed and uses the necessary environment variables to perform the following commands:

```sh
# Create a new admin user via an interactive prompt
docker exec -it 2bttns 2bttns-cli admin create

# Create a new admin user via command line arguments
docker exec 2bttns 2bttns-cli admin create credentials -u <username> -p <password>

docker exec 2bttns 2bttns-cli admin create oauth-allow -e <email>
```

#### From any terminal with the 2bttns CLI installed

You can use the 2bttns CLI to create a new admin user from any terminal that has the 2bttns CLI installed.

```sh
# Create a new admin user via an interactive prompt
2bttns-cli admin create -d <database-url> -s <nextauth-secret>

# Create a new admin user via command line arguments
2bttns-cli admin create credentials -d <database-url> -s <nextauth-secret> -u <username> -p <password>

2bttns-cli admin create oauth-allow -d <database-url> -s <nextauth-secret> -e <email>
```

#### Why am I getting a "Can't reach database server at `db-hostname:5432`" error?

This may happen when you use the 2bttns CLI outside of the 2bttns Docker container and give the CLI the incorrect database hostname, like this:

```sh
# Incorrect hostname in database URL
2bttns-cli admin create -d postgresql://username:password@db-hostname:5432/db
```

The Docker scripts we provide create a PostgreSQL database container that a 2bttns container in the same Docker network connects to using the internal hostname -- for example, `postgresql://username:password@db-hostname:5432/db`.

If the database Docker container properly maps the PostgreSQL port to the host machine, you can connect to the database using `localhost`, like this:

```sh
# Correct hostname database URL
2bttns-cli admin create -d postgresql://username:password@localhost:5432/db
```

### View Your 2bttns Admin Console

Navigate to [`http://localhost:3262`](http://localhost:3262) in your browser to view your 2bttns admin console, or to the proper host and port if you've configured them differently.

### Next Steps

...and that's it! You're ready to [manage games](https://docs.2bttns.com/docs/%F0%9F%9A%80%20Getting%20Started/quick-start#create-game) and [integrate your app with 2bttns](https://docs.2bttns.com/docs/%F0%9F%9A%80%20Getting%20Started/quick-start#bounce-users-to-game).

## Environment Variables

These are the environment variables you can configure for your 2bttns admin console.

| Variable Name       | Description                                                                                                    | Example                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `DATABASE_URL`      | The URL of the Postgres database to connect to.                                                                | `postgresql://username:password@db-hostname:port/db`                                 |
| `NEXTAUTH_SECRET`   | The secret used by NextAuth. You can generate a new secret on the command line with: `openssl rand -base64 32` | `placeholder-secret-remember-to-change`                                              |
| `NEXTAUTH_URL`      | The URL of the 2bttns app.                                                                                     | `http://localhost:3262`                                                              |
| `GITHUB_ID`         | The GitHub OAuth app ID, if you want to allow admin users to sign in via GitHub.                               | `1234567890`                                                                         |
| `GITHUB_SECRET`     | The GitHub OAuth app secret that corresponds to your `GITHUB_ID`.                                              | `placeholder-secret-remember-to-change`                                              |
| `SERVER_LOG_LEVEL`  | The log level for the server.                                                                                  | `error` \| `warn` \| `info` _(default)_ \| `http` \| `verbose` \| `debug` \| `silly` |
| `SERVER_LOG_LOCALE` | The log locale for the server.                                                                                 | `en-US`                                                                              |

# Contributions

We welcome contributions to the 2bttns project! Please read our contributing guidelines (TODO).

## Local Development

Here's a how-to for setting up your local development environment when working on the 2bttns app.

### Environment Variables

First, set up the environment variables folder by copying `.env.example` to a new `.env` file. The console app will work out of the box with the default environment variables, but you can customize them to your needs.

### Docker Compose

We use Docker Compose to initialize `dev-db` and `test-db` PostgreSQL databases. Be sure to have Docker with Docker Compose installed and running before running tests.

You can modify the Docker database configurations in `docker-compose.yml`.

### Local Development

For local development, run the following commands inside the root `app` folder:

```sh
# Install npm dependencies
npm i
```

```sh
# Start the dev-db Docker container (this is a local Postgres database)
npm run docker:up:dev-db

# Apply the necessary 2bttns Prisma migrations to the database
# This uses the `DATABASE_URL` environment variable in `.env`
npm run migrate

# Seed the database with example data (optional)
# This also uses the `DATABASE_URL` environment variable in `.env`
npm run seed
```

```sh
# Create an admin account in your dev db
# Behind the scenes, this uses the 2bttns-cli
# with your .env environment variables loaded
npm run create-admin
```

```sh
 # Start the admin console app
npm run dev
```

### Testing

#### Prerequisites

Be sure to have Node.js/NPM and Docker Compose available on the machine you're running the tests on.

#### Running tests

Run the tests with the following command inside the root `app` folder:

```sh
npm i              # Install npm dependencies, if you haven't already
npm run test       # Run tests
```

### Running the 2bttns Docker Image Locally

You can run the 2bttns Docker image locally with the following commands

```sh
# Start the Dockerized twobttns service based on `docker-compose.yml`
# The 2bttns container will build locally based on the Dockerfile
docker-compose up twobttns

# Apply the necessary 2bttns Prisma migrations to the database & seed it with example data
docker exec -it 2bttns 2bttns-cli db migrate
docker exec -it 2bttns 2bttns-cli db seed

# Create an admin user
docker exec -it 2bttns 2bttns-cli admin create

# To stop the twobttns service, run the following command:
docker-compose down twobttns

# The local-prod-db container uses a volume to store its data, so subsequent runs of the local-prod-db container will use the same data.
# You can delete the volume with the following command:
docker volume rm app_postgres-data-local-prod
```

This will start the `2bttns` container and the `local-prod-db` containers. The `2bttns` container is built using the local Dockerfile. You can access the dockerized 2bttns app at `localhost:3262`.

### Managing the `dev-db` container

The `dev-db` container will contain your local development database. It is created and managed by Docker Compose in the `docker-compose.yml` file.

Here are some useful commands to manage the `dev-db` container:

```sh
# Stop all containers used by the app (e.g. dev-db and test-db containers)
npm run docker:stop
```

```sh
# Start the dev-db container, from scratch or if it was stopped
npm run docker:up:dev-db

# Apply migrations and seed the dev-db container
# You only need to run this when you create your dev-db container for the first time
npm run migrate
npm run seed
```

```sh
# Remove the dev-db container
# This will not delete the database's data because it is stored in a volume
npm run docker:rm:dev-db

# If you want to delete the dev-db database's data volume, run the following command:
docker volume rm app_postgres-data-dev
```

Note that these NPM scripts are just for convenience. You can manage the `dev-db` container manually using the docker/docker-compose CLI.

### Troubleshooting

#### Bind for 0.0.0.0:xxxx failed: port is already allocated

This means you have another active container mapped to the specified port. To fix this, stop the container that is using the port.

```sh
# Find the container that is using the port
docker ps
docker stop <container-id>
```

#### Can't reach database server at `localhost:xxxx`

The database corresponding to the `DATABASE_URL` in `.env` you've configured might not be running.

For example, you might see this error if you run `npm run dev` before starting the `dev-db` container.

#### Default ports used by this project

- `localhost:3001`

  Local development server started via `npm run dev`

- `localhost:5433`

  Postgres Docker dev db started via `npm run docker:up:dev-db`

- `localhost:5434`

  Postgres Docker test db started via `npm run docker:up:test-db`

- `localhost:3262`

  Production build started via `npm run build && npm run start`.

  This is also the default port used by the Docker build.

# Additional Information

## Admin Users

The 2bttns admin console is managed by admin users.

You can create admin users using the `2bttns-cli` via NPM.

```sh
npx @2bttns/2bttns-cli admin create -d <database-url> -s <nextauth-secret>
```

The CLI will prompt you to create an admin user with credentials (username-password) or add emails to an OAuth allow list.

## GitHub OAuth (Optional)

2bttns supports GitHub OAuth through NextAuth out of the box.

To set up GitHub OAuth, set the following credentials in your `.env` file:

```
# Next Auth GitHub Provider

GITHUB_ID="<YOUR_GITHUB_ID>"
GITHUB_SECRET="<YOUR_GITHUB_SECRET>"
```

You can get these credentials by creating a new OAuth app via...

- a) Your GitHub account - `https://github.com/settings/developers`
- b) Your GitHub organization - `https://github.com/organizations/<your-organization>/settings/applications`

For local development, when configuring the OAuth app, set the homepage URL to `http://localhost:3001` and set the callback url to `http://localhost:3001/api/auth/callback/github` (or use a custom port you've configured).

If you do not set the `GITHUB_ID` and `GITHUB_SECRET` environment variables, the GitHub OAuth provider will not be enabled and will not appear on the login page.

### Admin Allow List

OAuth admins who are not in the 2bttns-managed `AdminOAuthAllowList` database table and attempt to log in to the admin panel will be denied access.

You can add admin emails to the allow list in the following ways:

#### 1. `npm run create-admin`

Select the "Create Admin using Github OAuth" prompt and enter the email associated with the GitHub account you want to grant access to.

Behind the scenes, this uses the 2bttns-cli with your local `.env` environment variables loaded. In production environments, you should use the 2bttns-cli directly with the necessary parameters to connect to your production database.

#### 2. via Prisma Studio or a Database Client

You can manually add allowed admin emails to the `AdminOAuthAllowList` table via the Prisma Studio UI (`npx prisma studio`) or manually through another database client of your choice.

### 3. via the 2bttns Admin Panel

@TODO - this feature is not yet implemented.

## Next Auth Secret

2bttns uses Next Auth to authenticate users, which requires a `NEXTAUTH_SECRET` environment variable in the `.env` file:

```
# .env
# Next Auth
# You can generate a new secret on the command line with:
# openssl rand -base64 32
# https://next-auth.js.org/configuration/options#secret
NEXTAUTH_SECRET="placeholder-secret-remember-to-change"
```

The `NEXTAUTH_SECRET` is also used to salt admin credential passwords when using the `npm run create-admin` command. Note that if the value does not match the salt used to hash the password, the admin user will not be able to log in.

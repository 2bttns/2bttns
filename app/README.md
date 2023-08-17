# 2bttns

Integrate your app with 2bttns through our official Docker image, available on Docker Hub: https://hub.docker.com/r/2bttns/2bttns

## Quickstart

We've provided a few ways for you to get started quickly with 2bttns. Feel free to customize these scripts to your needs.

### via Docker in the Command Line

Execute the `docker-run.sh` script from https://github.com/2bttns/2bttns/blob/dockerize/install/docker-run

```bash
# Creates a 2bttns admin console Docker container that uses a PostgreSQL database container
$ curl -s https://raw.githubusercontent.com/2bttns/2bttns/dockerize/install/docker-run/docker-run.sh | bash -s

# You can clean up the Docker containers created by docker-run.sh with the following command:
$ curl -s https://raw.githubusercontent.com/2bttns/2bttns/dockerize/install/docker-run/cleanup.sh | bash -s

# Your database data is stored in a Docker volume, which is not removed up by cleanup.sh.
# This means subsequent runs of docker-run.sh will use the same database data.
# If you want to delete the Docker volume, run the following command:
$ docker volume rm db-hostname
```

### via Docker-Compose

```yaml
# docker-compose.yml
version: "3.9"
services:
  twobttns:
    image: 2bttns/2bttns
    restart: unless-stopped
    container_name: 2bttns
    ports:
      - "3262:3262"
    depends_on:
      - local-prod-db
    environment:
      DATABASE_URL: postgresql://local-prod-user:local-prod-pass@host.docker.internal:5432/local-prod-db
      NEXTAUTH_SECRET: placeholder-secret-remember-to-change
  local-prod-db:
    image: postgres:13
    restart: unless-stopped
    container_name: local-prod-db-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: local-prod-user
      POSTGRES_PASSWORD: local-prod-pass
      POSTGRES_DB: local-prod-db
```

```bash
# In the same directory as your docker-compose.yml file:
# Start your containers
$ docker-compose up

# Apply the necessary 2bttns Prisma migrations to the database
$ docker exec -it 2bttns 2bttns-cli db migrate

# Seed the database with example data (optional)
$ docker exec -it 2bttns 2bttns-cli db seed

# Create an admin user
$ docker exec -it 2bttns 2bttns-cli admin create
```

### View Your 2bttns Admin Console

Navigate to [`http://localhost:3262`](http://localhost:3262) in your browser to view your 2bttns admin console.

## Environment Variables

These are the environment variables you can configure for your 2bttns admin console.

| Variable Name       | Description                                                                                                    | Example                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `DATABASE_URL`      | The URL of the Postgres database to connect to.                                                                | `postgresql://local-prod-user:local-prod-pass@localhost:5432/local-prod-db`          |
| `NEXTAUTH_SECRET`   | The secret used by NextAuth. You can generate a new secret on the command line with: `openssl rand -base64 32` | `placeholder-secret-remember-to-change`                                              |
| `NEXTAUTH_URL`      | The URL of the 2bttns app.                                                                                     | `http://localhost:3001`                                                              |
| `GITHUB_ID`         | The GitHub OAuth app ID, if you want to allow admin users to sign in via GitHub.                               | `1234567890`                                                                         |
| `GITHUB_SECRET`     | The GitHub OAuth app secret that corresponds to your `GITHUB_ID`.                                              | `placeholder-secret-remember-to-change`                                              |
| `SERVER_LOG_LEVEL`  | The log level for the server.                                                                                  | `error` \| `warn` \| `info` _(default)_ \| `http` \| `verbose` \| `debug` \| `silly` |
| `SERVER_LOG_LOCALE` | The log locale for the server.                                                                                 | `en-US`                                                                              |

# Contributions

We welcome contributions to the 2bttns project! Please read our contributing guidelines (TODO).

## Local Development

Here's a how-to for setting up your local development environment when working on the 2bttns app.

### Environment Variables

First, set up the environment variables folder by copying `.env.example` to a new `.env` file. Follow the instructions in the `.env.example` file to set up your environment variables.

### Docker Compose

We use Docker Compose to initialize `dev-db` and `test-db` PostgreSQL databases. Be sure to have Docker with Docker Compose installed and running before running tests.

You can modify the Docker database configurations in `docker-compose.yml`.

### Local Development

For local development, run the following commands inside the root `app` folder:

```bash
# Install npm dependencies
$ npm i
```

```bash
# Start the dev-db Docker container (this is a local Postgres database)
$ npm run docker:up:dev-db

# Apply the necessary 2bttns Prisma migrations to the database
# This uses the `DATABASE_URL` environment variable in `.env`
$ npm run migrate

# Seed the database with example data (optional)
# This also uses the `DATABASE_URL` environment variable in `.env`
$ npm run seed
```

```bash
# Create an admin account in your dev db
# Behind the scenes, this uses the 2bttns-cli
# with your .env environment variables loaded
$ npm run create-admin
```

```bash
 # Start the admin console app
$ npm run dev
```

### Testing

#### Prerequisites

Be sure to have Node.js/NPM and Docker Compose available on the machine you're running the tests on.

#### Running tests

Run the tests with the following command inside the root `app` folder:

```bash
$ npm i              # Install npm dependencies, if you haven't already
$ npm run test       # Run tests
```

### Testing the Docker Image Locally

You can test the 2bttns Docker image locally by running the following commands inside the root `app` folder. This uses the `docker-compose.yml`file in the root `app` folder.

```bash
$ docker-compose up twobttns

# Apply the necessary 2bttns Prisma migrations to the database & seed it with example data
$ npx @2bttns/2bttns-cli db migrate -d postgresql://local-prod-user:local-prod-pass@localhost:5432/local-prod-db
$ npx @2bttns/2bttns-cli db seed -d postgresql://local-prod-user:local-prod-pass@localhost:5432/local-prod-db

# Create an admin user
$ npx @2bttns/2bttns-cli admin create -d postgresql://local-prod-user:local-prod-pass@localhost:5432/local-prod-db -s placeholder-secret-remember-to-change

# To stop the containers, run the following command:
$ docker-compose down twobttns

# The local-prod-db container uses a volume to store its data, so subsequent runs of the local-prod-db container will use the same data.
# You can delete the volume with the following command:
$ docker volume rm app_postgres-data-local-prod
```

This will start the `twobttns` container and the `local-prod-db` containers. The `twobttns` container is built using the local Dockerfile. You can access the dockerized 2bttns app at `localhost:3262`.

### Managing the `dev-db` container

The `dev-db` container will contain your local development database. It is created and managed by Docker Compose in the `docker-compose.yml` file.

Here are some useful commands to manage the `dev-db` container:

```bash
# Stop all containers used by the app (e.g. dev-db and test-db containers)
$ npm run docker:stop
```

```bash
# Start the dev-db container, from scratch or if it was stopped
$ npm run docker:up:dev-db

# Note that the previous command does not run Prisma
# migrations or seed the db.
# To do that, run the following commands:
$ npm run migrate
$ npm run seed
```

```bash
# Remove the dev-db container
# This will not delete the database's data because it is stored in a volume
$ npm run docker:rm:dev-db

# If you want to delete the dev-db database's data volume, run the following command:
$ docker volume rm app_postgres-data-dev
```

Note that these NPM scripts are just for convenience. You can manage the `dev-db` container manually using the docker/docker-compose CLI.

### Troubleshooting

#### Bind for 0.0.0.0:xxxx failed: port is already allocated

This means you have a db container on the specified port already running. You can stop it by running the following command inside the `app` folder:

```bash
$ npm run docker:stop
```

#### Can't reach database server at `localhost:xxxx`

The database corresponding to the `DATABASE_URL` in `.env` you've configured might not be running.

For example, you might see this error if you run `npm run dev` before starting the `dev-db` container.

#### Default ports used by this project

- `localhost:3001` - Dev app started via `npm run dev`
- `localhost:5433` - Postgres Docker dev db started via `npm run docker:up:dev-db`
- `localhost:5434` - Postgres Docker test db started via `npm run docker:up:test-db`
- `localhost:3262` - Production build started via `npm run build && npm run start`

# Additional Information

## Admin Users

The 2bttns admin console is managed by admin users.

You can create admin users using the `2bttns-cli` via NPM.

```bash
$ npx @2bttns/2bttns-cli admin create -d <database-url> -s <nextauth-secret>
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

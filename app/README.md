# 2bttns

## First-time setup

### Environment Variables

First, set up the environment variables folder by copying `.env.example` to a new `.env` file.

### Docker Compose

We use Docker Compose to initialize a `dev-db` and `test-db` PostgreSQL databases. Be sure to have Docker with Docker Compose installed and running before running tests.

You can modify the database container credentials in `docker-compose.yml`.

### Local Development

For local development, run the following commands inside the root `app` folder:

```bash
# Install npm dependencies
$ npm i
```

```bash
# This next NPM script does the following:
#   1. Start the dev-db container
#   2. Syncs the dev-db container to Prisma schema migrations
#   3. Seeds the db with example data
$ npm run init-db:dev
```

```bash
 # Start the app
$ npm run dev
```

---

## Admin Login

### GitHub OAuth

2bttns uses GitHub OAuth through NextAuth to authenticate 2bttns admin users.

To set up GitHub OAuth, set the following credentials in your `.env` file:

```
# Next Auth GitHub Provider
GITHUB_ID="<YOUR_GITHUB_ID>"
GITHUB_SECRET="<YOUR_GITHUB_SECRET>"
```

You can get these credentials by creating a new OAuth app via...

- a) Your GitHub account - `https://github.com/settings/developers`
- b) Your GitHub organization - `https://github.com/organizations/<your-organization>/settings/applications/2114572`

For local development, when configuring the OAuth app, set the homepage URL to `http://localhost:3001` and set the callback url to `http://localhost:3001/api/auth/callback/github` (or use a custom port you've configured).

### Admin Allow List

Users who are not in the admin allow list and attempt to log in will see an "Access Denied" error.

To configure the admin allow list...

1. Copy the `adminAllowList.json.example` file to a new `adminAllowList.json` file, if it doesn't already exist.

2. Add the emails associated with the GitHub accounts you want to grant access to.

### Next Auth Secret

2bttns uses Next Auth to authenticate users, and requires a NEXTAUTH_SECRET environment variable in the `.env` file:

```
# .env
# Next Auth
# You can generate a new secret on the command line with:
# openssl rand -base64 32
# https://next-auth.js.org/configuration/options#secret
NEXTAUTH_SECRET="<secret>"
```

---

## Managing the `dev-db` container

The `dev-db` container will contain your local development database. It is created and managed by Docker Compose in the `docker-compose.yml` file.

Here are some useful commands to manage the `dev-db` container:

```bash
# Stop all containers used by the app (e.g. dev-db and test-db containers)
# This is useful if you want to stop the dev-db container without deleting it's data
$ npm run docker:stop
```

```bash
# Start the dev-db container, from scratch or if it was stopped
$ npm run docker:up:dev-db

# Note that this does not run Prisma migrations or seed the db.
# To do that, run the following command:
$ npm run init-db:dev
```

```bash
# Remove the dev-db container
# CAUTION: this will delete the dev-db container's data
$ npm run docker:rm:dev-db
```

Note that these NPM scripts are just for convenience. You can manage the `dev-db` container manually using the docker/docker-compose CLI.

---

## Testing

To run tests, first ensure your `.env` file has the `DATABASE_URL` environment variable set to the test-db credentials:

```bash

# Comment out the dev-db credentials
# DATABASE_URL="postgresql://dev-user:dev-pass@localhost:5433/dev-db"

# Uncomment the test-db credentials
DATABASE_URL="postgresql://test-user:test-pass@localhost:5433/test-db"

```

Then run the following command inside the root `app` folder:

```bash
$ npm run test       # Run tests

# Behind the scenes, this npm script will run the following commands:
# You do NOT need to run these commands manually.

# NPM script to stop existing db containers (e.g.
# dev-db container; doesn't delete it), initialize test db container,
# and runs Prisma migrations.
$ npm run init-db:test

# We use the `vitest` package to run our tests.
# vitest runs in watch mode, so you can re-run tests using its watch interface
 \ && vitest

# Finally, we remove the test db container when you exit vitest (CTRL+C)
 \ && npm run docker:rm:test-db
```

### Handling Test Errors

#### Authentication failed against database server

You may see the following error when running tests:

```
Error: P1000: Authentication failed against database server at `localhost`, the provided database credentials for `dev-user` are not valid.
```

This means your DATABASE_URL in `.env` is not set correctly (it may still be set as your dev-db). You can fix this by setting the `DATABASE_URL` to the following based on your test-db credentials configured in `docker-compose.yml`:

```bash
# .env
DATABASE_URL="postgresql://test-user:test-pass@localhost:5433/test-db"
```

When you're done testing, be sure to set `DATABASE_URL` back to your `dev-db` before running the app in development mode.

If your `dev-db` container was stopped, you can restart it by running the following command inside the `app` folder:

```bash
$ npm run docker:up:dev-db
```

#### Bind for 0.0.0.0:5433 failed: port is already allocated

This means you have a db container already running. You can stop it by running the following command inside the `app` folder:

```bash
$ npm run docker:stop
```

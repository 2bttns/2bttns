# 2bttns

## Setup for Local Development

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

## Deploying 2bttns to Production

### Building the App

You can build the admin app with the following command:

```bash
$ npm run build
```

Then, you can run the production-ready build with the following command:

```bash
$ npm run start
```

### Production Environment Variables

You can create a `.env.production` file to set environment variables for the production build. `npm run build` will automatically use the `.env.production` file if it exists.

If you plan to deploy the admin app to a production server via CI/CD or via services like Vercel, you should set the environment variables in their respective places instead.

### 2bttns Docker Image

@TODO Create a `2bttns/admin` Docker image. Should accept environment variables.

---

## Admin Login

### "Admin Users" vs "Players"

Any reference to "Users" in the 2bttns admin app refers to dmin users logged in via GitHub OAuth. Admin users manage the 2bttns dashboard, managing various aspects of the app, such as games, gameobjects, and 2bttns API secret keys.

Customers who are sent to 2bttns to play games are referred to as "Players".

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
- b) Your GitHub organization - `https://github.com/organizations/<your-organization>/settings/applications`

For local development, when configuring the OAuth app, set the homepage URL to `http://localhost:3001` and set the callback url to `http://localhost:3001/api/auth/callback/github` (or use a custom port you've configured).

### Admin Allow List

Users who are not in the 2bttns-managed `AllowedAdmin` database table and attempt to log in to the admin panel will be denied access.

### Initial Admin Users

The 2bttns app uses an `adminAllowList.json` file to populate the `AllowedAdmin` table with a list of emails associated with GitHub accounts allowed to log in to the admin app.

To configure the initial admin allow list...

1. Copy the `adminAllowList.json.example` file to a new `adminAllowList.json` file, if it doesn't already exist.

2. Add the emails associated with the GitHub accounts you want to grant access to.

Now, whenever you seed the database (e.g. `npm run db-seed:dev`), the `AllowedAdmin` table will be updated with the emails in the `adminAllowList.json` file.

### Adding Admin Users

Once you have the initial admin users set up, you can add more admin users in the following ways:

#### via Prisma Studio or a Database Client

You can manually add allowed admin emails to the `AllowedAdmin` table via the Prisma Studio UI (`npx prisma studio`) or manually through another database client of your choice.

### via the 2bttns Admin Panel

@TODO

When logged in as an admin user, you can add more admin users via the 2bttns Admin Panel at the `Settings > Admin Users` page.

### Next Auth Secret

2bttns uses Next Auth to authenticate users, and requires a `NEXTAUTH_SECRET` environment variable in the `.env` file:

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

# Note that the previous command does not run Prisma
# migrations or seed the db.
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

### Prerequisites

Be sure to have Node.js/NPM and Docker Compose available on the machine you're running the tests on.

### Running tests

Run the tests with the following command inside the root `app` folder:

```bash
$ npm i              # Install npm dependencies, if you haven't already
$ npm run test       # Run tests

# Behind the scenes, this npm script will run the following commands:
# You do not need to run these commands manually

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

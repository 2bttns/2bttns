# docker-run

2bttns admin console Docker setup via Docker run commands.

## Prerequisites

- Docker

## Usage

### docker-run.sh

```bash
$ ./docker-run.sh
```

This script will:

1. Create a PostgreSQL database container attached with a Docker volume and a Docker network.
2. Create a 2bttns admin console container in the same Docker network.
3. Apply the necessary 2bttns admin console database migrations to the PostgreSQL database.
4. Seed the PostgreSQL database with example data
5. Prompt you to create an admin user for the 2bttns admin console.
6. Echo the URL of your 2bttns admin console.

### docker-run-minimal.sh

A minimal version of `docker-run.sh` that only creates the 2bttns container.

Use this if you already have a PostgreSQL database running somewhere -- be sure to update the `DATABASE_URL` environment variable in `docker-run-minimal.sh` to point to your database.

```bash
$ ./docker-run-minimal.sh
```

### cleanup.sh

This script cleans up most Docker objects created by `docker-run.sh` and `docker-run-minimal.sh`

```bash
$ ./cleanup.sh
```

This does not clean up the Docker Volume created by `docker-run.sh` -- you can do that manually by running `docker volume rm db-hostname`.

## FAQ

### How can I create a new admin user for my 2bttns admin console?

You can use the 2bttns CLI to create a new admin user.

#### Directly on your 2bttns admin console container

The [2bttns/2bttns](https://hub.docker.com/r/2bttns/2bttns) Docker image comes with the 2bttns CLI pre-installed and uses the necessary environment variables to perform the following commands:

```bash
# Create a new admin user via an interactive prompt
$ docker exec -it 2bttns 2bttns-cli admin create

# Create a new admin user via command line arguments
$ docker exec 2bttns 2bttns-cli admin create credentials -u <username> -p <password>
$ docker exec 2bttns 2bttns-cli admin create oauth-allow -e <email>
```

#### From any terminal with the 2bttns CLI installed

You can use the 2bttns CLI to create a new admin user from any terminal that has the 2bttns CLI installed.

```bash
# Create a new admin user via an interactive prompt
$ 2bttns-cli admin create -d <database-url> -s <nextauth-secret>

# Create a new admin user via command line arguments
$ 2bttns-cli admin create credentials -d <database-url> -s <nextauth-secret> -u <username> -p <password>
$ 2bttns-cli admin create oauth-allow -d <database-url> -s <nextauth-secret> -e <email>
```

#### Additional `2bttns-cli` Information

See the [2bttns-cli documentation](https://www.npmjs.com/package/@2bttns/2bttns-cli)

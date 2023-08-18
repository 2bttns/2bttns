# docker-run

2bttns admin console setup via Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)

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

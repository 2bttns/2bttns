# docker-compose

2bttns admin console setup via Docker Compose.

## Prerequisites

- [Docker Compose](https://docs.docker.com/compose/install/)

## Usage

### `init.sh`

```sh
./init.sh
```

This script will:

1. Use the `docker-compose.yml`

   This will...

   i. Create a PostgreSQL database container attached with a Docker volume.

   ii. Create a 2bttns admin console container from our [official Docker image](https://hub.docker.com/r/2bttns/2bttns). The admin console will use the PostgreSQL container as its database.

2. Apply the necessary 2bttns admin console database migrations to the PostgreSQL database.
3. Seed the PostgreSQL database with example data.

### Manual Setup

The following steps are the same as `init.sh`, but are detailed here if you want to execute them manually.

First, copy the `docker-compose.yml` file to your current working directory from the `install/docker-compose/` folder of the 2bttns repository. You can modify the file to suit your needs.

In the same directory, run the following commands:

```sh
docker-compose up -d
docker-compose exec -T twobttns 2bttns-cli db migrate
docker-compose exec -T twobttns 2bttns-cli db seed
```

### Cleanup

You can take down the containers using the following command in the same directory as the `docker-compose.yml` file:

```sh
docker-compose down
```

This won't remove the Docker Volume (which persists your db data even after doing `docker-compose down`) created by the compose file -- you can do that manually by running the following:

```sh
docker volume rm 2bttns-docker-compose_db-data
```

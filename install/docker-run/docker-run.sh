#!/bin/bash
NETWORK_NAME="2bttns-net"
POSTGRES_CONTAINER_NAME="db-hostname"
POSTGRES_DB_NAME="db"
TWOBTTNS_CONTAINER_NAME="2bttns"
HOST_PORT=3262

if [ "$(docker container ls -q -f name=$POSTGRES_CONTAINER_NAME)" ]; then
    echo "A Postgres Docker container instance is already running. Exiting..."
    exit 1
fi

if [ "$(docker container ls -q -f name=$TWOBTTNS_CONTAINER_NAME)" ]; then
    echo "A 2bttns Docker container instance is already running. Exiting..."
    exit 1
fi


# Create a Postgres Docker container
# You can skip this step if you already have a Postgres database running somewhere else.
# If so, be sure to update the DATABASE_URL environment variable below before running the 2bttns Docker container.
# This script will create a Docker network and volume if they don't already exist, which will be used by the Postgres Docker container.
echo ""
if [ "$(docker network ls -q -f name=$NETWORK_NAME)" ]; then
    echo "A Docker network with the name $NETWORK_NAME already exists. Skipping network creation..."
else
    echo "Creating Docker network (network name=$NETWORK_NAME)..."
    docker network create $NETWORK_NAME > /dev/null
fi

echo ""
if [ "$(docker volume ls -q -f name=$POSTGRES_CONTAINER_NAME)" ]; then
    echo "A Docker volume with the name $POSTGRES_CONTAINER_NAME already exists. Skipping volume creation..."
else
    echo "Creating Docker volume (volume name=$POSTGRES_CONTAINER_NAME)..."
    docker volume create $POSTGRES_CONTAINER_NAME > /dev/null
fi

echo ""
echo "Creating Postgres Docker container (container name=$POSTGRES_CONTAINER_NAME, db name=$POSTGRES_DB_NAME)..."
docker container run -d \
    --name $POSTGRES_CONTAINER_NAME \
    --network $NETWORK_NAME \
    -v $POSTGRES_CONTAINER_NAME:/var/lib/postgresql/data \
    -p 5432:5432 \
    -e POSTGRES_USER="username" \
    -e POSTGRES_PASSWORD="password" \
    -e POSTGRES_DB="$POSTGRES_DB_NAME" \
    postgres:13 \
    > /dev/null

# Create the 2bttns Docker container
# Be sure to update the DATABASE_URL environment variable to your desired database connection string before running the 2bttns Docker container.
echo ""
echo "Creating 2bttns Docker container (container name=$TWOBTTNS_CONTAINER_NAME)..."
docker container run -d \
    --name $TWOBTTNS_CONTAINER_NAME \
    --network $NETWORK_NAME \
    -p $HOST_PORT:3262 \
    -e DATABASE_URL="postgresql://username:password@$POSTGRES_CONTAINER_NAME:5432/$POSTGRES_DB_NAME" \
    -e NEXTAUTH_SECRET="placeholder-secret-remember-to-change" \
    2bttns/2bttns \
    > /dev/null

# Ensure the containers are running
if [ -z "$(docker container ls -aq -f name=$POSTGRES_CONTAINER_NAME)" ]; then
    echo "Postgres Docker container failed to start. Exiting..."
    exit 1
fi

if [ -z "$(docker container ls -aq -f name=$TWOBTTNS_CONTAINER_NAME)" ]; then
    echo "2bttns Docker container failed to start. Exiting..."
    exit 1
fi

# Apply the necessary 2bttns Prisma migrations to the database
echo ""
echo "Running \`2bttns-cli db migrate\`..."
docker exec $TWOBTTNS_CONTAINER_NAME 2bttns-cli db migrate

# Seed the database with example data (optional)
echo ""
echo "Running \`2bttns-cli db seed\`..."
docker exec $TWOBTTNS_CONTAINER_NAME 2bttns-cli db seed

# Done!
echo ""
echo "2bttns is now running at port :$HOST_PORT"

echo ""
echo "To log in to your 2bttns console, you'll need to create an admin user account."
echo "You can do this by running \`docker exec -it $TWOBTTNS_CONTAINER_NAME 2bttns-cli admin create\`"
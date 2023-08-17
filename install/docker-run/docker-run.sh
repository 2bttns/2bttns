#!/bin/bash
NETWORK_NAME="2bttns-net"
POSTGRES_CONTAINER_NAME="db-hostname"
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
echo ""
echo "Creating a Postgres Docker container (container name=$POSTGRES_CONTAINER_NAME)..."
docker network create $NETWORK_NAME > /dev/null
docker container run -d \
    --name $POSTGRES_CONTAINER_NAME \
    --network $NETWORK_NAME \
    -p 5432:5432 \
    -e POSTGRES_USER="username" \
    -e POSTGRES_PASSWORD="password" \
    -e POSTGRES_DB="db-name" \
    postgres:13 \
    > /dev/null

# Create the 2bttns Docker container
# Be sure to update the DATABASE_URL environment variable to your desired database connection string before running the 2bttns Docker container.
echo ""
echo "Creating the 2bttns Docker container (container name=$TWOBTTNS_CONTAINER_NAME)..."
docker container run -d \
    --name $TWOBTTNS_CONTAINER_NAME \
    --network $NETWORK_NAME \
    -p $HOST_PORT:3262 \
    -e DATABASE_URL="postgresql://username:password@$POSTGRES_CONTAINER_NAME:5432/db-name" \
    -e NEXTAUTH_SECRET="placeholder-secret-remember-to-change" \
    2bttns/2bttns \
    > /dev/null


# Apply the necessary 2bttns Prisma migrations to the database
echo ""
echo "Running \`2bttns-cli db migrate\`..."
docker exec $TWOBTTNS_CONTAINER_NAME 2bttns-cli db migrate

# Seed the database with example data (optional)
echo ""
echo "Running \`2bttns-cli db seed\`..."
docker exec $TWOBTTNS_CONTAINER_NAME 2bttns-cli db seed

# Create an admin user
echo ""
echo "Prompting for admin user creation..."
docker exec -it $TWOBTTNS_CONTAINER_NAME 2bttns-cli admin create

# Done!
echo "2bttns is now running at http://localhost:$HOST_PORT"
#!/bin/bash

TWOBTTNS_SERVICE_NAME="twobttns"   # 2bttns docker-compose service name
POSTGRES_SERVICE_NAME="db"         # postgresql docker-compose service name
TWOBTTNS_CONTAINER_NAME="2bttns"   # 2bttns container name created by the 2bttns docker-compose service

# Start your containers via docker-compose
docker-compose up -d 

# # Apply the necessary 2bttns Prisma migrations to the database
docker container exec $TWOBTTNS_CONTAINER_NAME 2bttns-cli db migrate

# # Seed the database with example data (optional)
docker container exec $TWOBTTNS_CONTAINER_NAME 2bttns-cli db seed

# Ensure the postgresql service is running
if [ -z "$(docker-compose ps -q $POSTGRES_SERVICE_NAME)" ]; then
    echo "'$POSTGRES_SERVICE_NAME' Docker service failed to start. Exiting..."
    exit 1
fi

# Ensure the twobttns service is running
if [ -z "$(docker-compose ps -q $TWOBTTNS_SERVICE_NAME)" ]; then
    echo "'$TWOBTTNS_SERVICE_NAME' Docker service failed to start. Exiting..."
    exit 1
fi

# Echo the port of the twobttns container
echo ""
output="$(docker-compose port $TWOBTTNS_SERVICE_NAME 3262)"
output="${output#*:}"
echo "Your 2bttns instance is now running at port :$output"

echo ""
echo "To log in to your 2bttns console, you'll need to create an admin user account."
echo "You can do this by running \`docker-compose exec $TWOBTTNS_SERVICE_NAME 2bttns-cli admin create\`"
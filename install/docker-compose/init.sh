#!/bin/bash

TWOBTTNS_SERVICE_NAME=twobttns

# Start your containers via docker-compose
docker-compose up -d

# Apply the necessary 2bttns Prisma migrations to the database
docker-compose exec -T $TWOBTTNS_SERVICE_NAME 2bttns-cli db migrate

# Seed the database with example data (optional)
docker-compose exec -T $TWOBTTNS_SERVICE_NAME 2bttns-cli db seed

# Echo the port of the twobttns container
echo ""
output="$(docker-compose port $TWOBTTNS_SERVICE_NAME 3262)"
output="${output#*:}"
echo "Your 2bttns instance is now running at port :$output"

echo ""
echo "To log in to your 2bttns console, you'll need to create an admin user account."
echo "You can do this by running \`docker-compose exec -T $TWOBTTNS_SERVICE_NAME 2bttns-cli admin create\`"
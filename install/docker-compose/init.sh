#!/bin/bash
# Start your containers via docker-compose
docker-compose up -d

# Apply the necessary 2bttns Prisma migrations to the database
docker-compose exec -T twobttns 2bttns-cli db migrate

# Seed the database with example data (optional)
docker-compose exec -T twobttns 2bttns-cli db seed
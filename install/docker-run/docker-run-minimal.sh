#!/bin/sh
# Be sure to update the DATABASE_URL environment variable to your desired database connection string before running the 2bttns Docker container.
docker container run -d \
    --name 2bttns \
    -p 3262:3262 \
    -e DATABASE_URL="postgresql://username:password@db-hostname:port/db" \
    -e NEXTAUTH_SECRET="placeholder-secret-remember-to-change" \
    2bttns/2bttns
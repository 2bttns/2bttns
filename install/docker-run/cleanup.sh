#!/bin/bash
NETWORK_NAME="2bttns-net"
POSTGRES_CONTAINER_NAME="db-hostname"
TWOBTTNS_CONTAINER_NAME="2bttns"

if [ "$(docker container ls -aq -f name=$POSTGRES_CONTAINER_NAME)" ]; then
    echo "Removing 2bttns Docker container..."
    docker container rm -f $TWOBTTNS_CONTAINER_NAME > /dev/null
fi

if [ "$(docker container ls -aq -f name=$POSTGRES_CONTAINER_NAME)" ]; then
    echo "Removing Postgres Docker container..."
    docker container rm -f $POSTGRES_CONTAINER_NAME > /dev/null
fi

if [ "$(docker network ls -q -f name=$NETWORK_NAME)" ]; then
    echo "Removing 2bttns-net Docker network..."
    docker network rm $NETWORK_NAME > /dev/null
fi
docker container run \
    --name 2bttns -p 3262:3262 --rm  \
    -e DATABASE_URL="postgresql://dev-user:dev-pass@host.docker.internal:5433/dev-db" \
    2bttns/2bttns
docker container run \
    --name 2bttns -p 80:3262 --rm  \
    -e DATABASE_URL="postgresql://dev-user:dev-pass@host.docker.internal:5433/dev-db" \
    2bttns/2bttns
#!/bin/bash

# Organize copied Prisma files after the build
# Prisma binary target files like linux-musl-openssl-3.0.x or darwin-arm64 need to be at the same level as the prisma.schema, or else PrismaClient can't find them
mv dist/client/* dist/ && rm -rf dist/client

# Copy the migrations folder to the dist folder
# This is necessary for the db migration command
cp -r ../../app/prisma/migrations dist/

# The following mv line is disabled because PrismaClient can't seem to find the schema.prisma file in the dist/prisma folder if we move it there, 
# so we're keeping it at the root of dist/ unless we can figure out a way to make it work
# mv dist/schema.prisma dist/prisma     

# Config folder
mkdir dist/config
cat << EOF > dist/config/local.json
{
    "db": { "url" : null },
    "nextAuthSecret": null
}
EOF



# Link the build
# This makes the `2bttns-cli` command available globally on your machine
# To manually unlink it, you can run `npm run unlink` in this directory
npm run link
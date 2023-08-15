# @2bttns/2bttns-cli

The 2bttns command line interface.

## Features

- Apply the necessary 2bttns migrations to the database you intend to use with 2bttns (`2bttns db migrate`)
- Interactive command to create 2bttns console administrators (`2bttns admin create`)
- Set configuration values via the command line (e.g. `2bttns config set db.url <value>`)

## Install

```bash
# You can install the 2bttns CLI globally via npm:
$ npm i -g @2bttns/2bttns-cli

# Alternatively, you can call it via npx without installing it globally.
$ npx @2bttns/2bttns-cli <command>
```

## Usage

```bash
# If you installed it globally:
$ 2bttns-cli --help


# If you're calling it via npx:
$ npx @2bttns/2bttns-cli --help


# Apply migrations
## Migrate the specified database using the -d flag
$ 2bttns-cli db migrate -d postgresql://local-prod-user:local-prod-pass@localhost:5432/local-prod-db

## If you've set the db.url config value, you can omit the -d flag
$ 2bttns-cli db migrate

# Create example seed data (Games, Tags, GameObjects, and an example App Secret) in your database
## Seed the specified database using the -d flag
$ 2bttns-cli db seed -d postgresql://local-prod-user:local-prod-pass@localhost:5432/local-prod-db

## If you've set the db.url config value, you can omit the -d flag
$ 2bttns-cli db seed


# Create a new 2bttns console administrator:
$ 2bttns-cli admin create


# Set a configuration value
$ 2bttns-cli config set db.url postgresql://local-prod-user:local-prod-pass@localhost:5432/local-prod-db
```

## Configuration Value Precedence

The CLI takes configuration values from the following sources, in order of precedence:

1. Command line arguments (The `--db-url` flag, for example)
2. Config file (Set these via `2bttns config set <key> <value>`)

   ⚠️ An exception to this is if you set the `--ignore-config` flag, which in this case the CLI will ignore config values. This is useful if you want to use environment variables instead of the existing config.

3. Environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`)

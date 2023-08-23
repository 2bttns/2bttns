# @2bttns/2bttns-cli

The 2bttns command line interface.

## Features

- Apply the necessary 2bttns migrations to the database you intend to use with 2bttns (`2bttns db migrate`)
- Apply example data to the database you intend to use with 2bttns (`2bttns db seed`)
- Interactive command to create 2bttns console administrators (`2bttns admin create`), with command-line-only alternatives (`2bttns admin create credentials`, `2bttns admin create oauth-allow`)
- Set configuration values via the command line (e.g. `2bttns config set db.url <value>`) to avoid having to specify them every time you run a command

## Install

```bash
# You can install the 2bttns CLI globally via npm:
npm i -g @2bttns/2bttns-cli

# Alternatively, you can call it via npx without installing it globally.
npx @2bttns/2bttns-cli <command>
```

## Usage

### Get Started

```bash
# If installed globally:
2bttns-cli --help


# If calling it via npx:
npx @2bttns/2bttns-cli --help
```

### DB Migrations & Seeding

```bash
# Apply migrations
## Migrate the specified database using the -d flag
2bttns-cli db migrate -d <database-url>

# Create example seed data (Games, Tags, GameObjects, and an example App Secret) in your database
## Seed the specified database using the -d flag
## IMPORTANT: The database must be migrated via `2bttns-cli db migrate` before seeding, or else the seed will fail.
2bttns-cli db seed -d <database-url>

## If you have set the db.url config value, you can omit the -d flag
2bttns-cli db migrate
2bttns-cli db seed
```

### Create 2bttns Console Administrators

```bash
# Create a new 2bttns console administrator:
## Create an administrator via interactive prompts
2bttns-cli admin create -d <database-url> -s <nextauth-secret>

## Create an administrator via command line arguments
2bttns-cli admin create credentials -u <username> -p <password> -d <database-url> -s <nextauth-secret>
2bttns-cli admin create oauth-allow -e <email> -d <database-url> -s <nextauth-secret>

## If you have set the db.url and nextAuthSecret config values or have the proper environment variables set, you can omit the -d and -s flags
2bttns-cli admin create
2bttns-cli admin create credentials -u <username> -p <password>
2bttns-cli admin create oauth-allow -e <email>
```

### Configuration Values

Set configuration values via the CLI using the `config` command. Values set this way will be used by the CLI when running commands, so you don't have to specify them every time using flags.

#### Commands

```bash
# Set a configuration value
2bttns-cli config set <key> <value>

# Get the current value of a configuration value
2bttns-cli config get <key>

# Clear a configuration value
2bttns-cli config clear <key>
```

### Available Configuration Values

| Key              | Description                                                                                                                                                                                             | Default Value | Example Value                                        | Flag(s)          | Environment Variable |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------- | ---------------- | -------------------- |
| `db.url`         | The connection URL of the database you want to use with 2bttns.                                                                                                                                         | `null`        | `postgresql://username:password@db-hostname:port/db` | `-d`, `--db-url` | `DATABASE_URL`       |
| `nextAuthSecret` | The `NEXTAUTH_SECRET` used by your 2bttns admin console. <br/><br/> This value is reused for hashing admin credential passwords, and is only required when creating a new admin user using credentials. | `null`        | `placeholder-secret-remember-to-change`              | `-s`, `--secret` | `NEXTAUTH_SECRET`    |

#### Configuration Value Precedence

The CLI takes configuration values from the following sources, in order of precedence:

1. Command line arguments (The `--db-url` flag, for example)
2. Config file (Set these via `2bttns config set <key> <value>`)

   ⚠️ An exception to this is if you set the `--ignore-config` flag, which in this case the CLI will ignore config values. This is useful if you want to use environment variables instead of the existing config.

   ```bash
      # Example:
      # In this case, the CLI will use the necessary environment variables (DATABASE_URL, NEXTAUTH_SECRET) instead of the config file (if they exist)
      # If you do not know which environment variables to use for certain commands, the command will warn you if you are missing any.
      2bttns-cli admin create --ignore-config
   ```

3. Environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`)

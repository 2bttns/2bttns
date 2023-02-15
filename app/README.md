# 2bttns

## First-time setup

First, set up the environment variables folder by copying `.env.example` to a new `.env` file.

Then run the following commands inside the `app` folder:

```bash
$ npm install           # Install npm dependencies
$ npm run db-sync:dev   # Prisma db setup (syncs schema migrations & seeds the db)
```

## Run the app

```bash
$ npm run dev           # Start the app
```

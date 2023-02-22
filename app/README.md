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

---

## Admin Login

### GitHub OAuth

2bttns uses GitHub OAuth through NextAuth to authenticate 2bttns admin users.

To set up GitHub OAuth, set the following credentials in your `.env` file:

```
# Next Auth GitHub Provider
GITHUB_ID="<YOUR_GITHUB_ID>"
GITHUB_SECRET="<YOUR_GITHUB_SECRET>"
```

You can get these credentials by creating a new OAuth app via...

- a) Your GitHub account - `https://github.com/settings/developers`
- b) Your GitHub organization - `https://github.com/organizations/<your-organization>/settings/applications/2114572`

For local development, when configuring the OAuth app, set the homepage URL to `http://localhost:3001` and set the callback url to `http://localhost:3001/api/auth/callback/github` (or use a custom port you've configured).

### Admin Allow List

Users who are not in the admin allow list and attempt to log in will see an "Access Denied" error.

To configure the admin allow list...

1. Copy the `adminAllowList.json.example` file to a new `adminAllowList.json` file, if it doesn't already exist.

2. Add the emails associated with the GitHub accounts you want to grant access to.

### Next Auth Secret

2bttns uses Next Auth to authenticate users, and requires a NEXTAUTH_SECRET environment variable in the `.env` file:

```
# app/.env
# Next Auth
# You can generate a new secret on the command line with:
# openssl rand -base64 32
# https://next-auth.js.org/configuration/options#secret
NEXTAUTH_SECRET="<secret>"
```

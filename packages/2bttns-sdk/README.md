![npm](https://img.shields.io/npm/v/@2bttns/sdk?style=for-the-badge)
![npm](https://img.shields.io/npm/dw/@2bttns/sdk?style=for-the-badge)
![npm](https://img.shields.io/npm/l/@2bttns/sdk?style=for-the-badge)

The official 2bttns Node.js SDK

# Getting Started

## Installation

```
npm install @2bttns/sdk
```

## Configuration

To use the SDK, you should instantiate the `TwoBttns` class using your 2bttns App ID, App Secret, and the base URL of your 2bttns app.

```typescript
/*  server/some/path/twobttns.ts  */
import TwoBttns from "@2bttns/sdk";
export const twobttns = new TwoBttns({
  appId: process.env.TWOBTTNS_APP_ID,
  secret: process.env.TWOBTTNS_APP_SECRET,
  url: process.env.TWOBTTNS_BASE_URL,
});
```

## Usage

> **Warning**
>
> The 2bttns SDK is intended for server-side use only.
>
> It should not be used by client-side code, because API requests are made using an access token generated using an API Key secret that should not be exposed.
>
> This SDK will throw an error if it detects it is being used in a browser environment.

After configuring the SDK, you can use your exported `twobttns` instance to interact with your 2bttns app.

### Making 2bttns API Calls

You can perform API calls against the 2bttns API using the `.callApi(...)` method.

The authentication process is handled automatically via a JWT generated from your App ID and App Secret.

```typescript
/*  server/path/to/api/handler.ts  */
const { data } = await twobttns.callApi("/players", "get");
```

### Create a Play URL

You can create a play URL using the `.generatePlayUrl(...)` method.

This method will return a secure URL that you redirect your users to in order to play a 2bttns game you specify.

```typescript
/*  server/path/to/api/handler.ts  */
const url = twobttns.generatePlayUrl({
  game_id: "game_id",
  user_id: "user_id",
  num_items: "ALL",
  callback_url: "https://example.com/callback",
});
```

## API Reference

@TODO

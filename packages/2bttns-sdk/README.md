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

Instantiate the `TwoBttnsApi` class using your 2bttns App ID, App Secret, and the base URL of your 2bttns app.

We suggest using [dotenv](https://www.npmjs.com/package/dotenv) to configure environment variables.

```sh
# .env file example
TWOBTTNS_APP_ID=example-app
TWOBTTNS_APP_SECRET=example-secret-value
TWOBTTNS_BASE_URL=http://localhost:3262
```

TypeScript:

```typescript
/*  server/some/path/twobttns.ts  */
import "dotenv/config";
import { TwoBttnsApi } from "@2bttns/sdk";

export const twobttns = new TwoBttnsApi({
  appId: process.env.TWOBTTNS_APP_ID!,
  secret: process.env.TWOBTTNS_APP_SECRET!,
  url: process.env.TWOBTTNS_BASE_URL!,
});
```

CommonJS:

```javascript
/*  server/some/path/twobttns.js  */
require("dotenv").config();
const { TwoBttnsApi } = require("@2bttns/sdk");

export const twobttns = new TwoBttnsApi({
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

> Tip 1: For the full list of available API endpoints that the 2bttns SDK can use, see the API documentation page on your 2bttns console (i.e. http://localhost:3262/api-documentation).

> Tip 2: The API client is built on openapi-typescript. It comes with TypeScript types and autocompletion out of the box.

Perform API calls against your 2bttns console API using the `.callApi(...)` method.

The authentication process is handled automatically via a Bearer JWT generated from your App ID and App Secret.

Examples:

```typescript
/*  server/path/to/api/example-handler.ts  */
// ...
const { data } = await twobttns.callApi("/game-objects", "post", {
  name: "caffè macchiato",
  tags: ["coffee", "beverages", "breakfast-menu"],
});
console.log(data.createdGameObject);
// ...
```

```typescript
/*  server/path/to/api/another-example-handler.ts  */
// ...
const { data } = await twobttns.callApi("/players", "get");
console.log(data.players);
// ...
```

```typescript
/*  server/path/to/api/yet-another-example-handler.ts  */
// ...
const { data } = await twobttns.callApi("/game-objects/ranked", "get", {
  inputTags: ["moods", "coffee"],
  outputTag: "coffee",
  playerId: "player-1",
});
console.log(data.scores);
// ...
```

### Generate Play URL

You can redirect users from your application to a 2bttns game you've created by generating a unique Play URL:

```ts
/*
 * Example Output: Example 2bttns play URL:  localhost:3262/play?game_id=example-game-0&app_id=example-app&jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoicGxheWVyX3Rva2VuIiwiYXBwSWQiOiJleGFtcGxlLWFwcCIsInBsYXllcklkIjoiZXhhbXBsZS1wbGF5ZXIiLCJpYXQiOjE3MDg3NjY4MzIsImV4cCI6MTcwODc3MDQzMn0.mfSdYMJCYGQfTr0U5y9nQKCayTOvx5FmdJv_IVHe1Rw&callback_url=http%3A%2F%2Flocalhost%3A3262
 */
demo2bttnsGeneratePlayURL();
async function demo2bttnsGeneratePlayURL() {
  const { data } = await twobttns.callApi(
    "/authentication/generatePlayURL",
    "get",
    {
      app_id: process.env.TWOBTTNS_APP_ID!,
      secret: process.env.TWOBTTNS_APP_SECRET!,
      callback_url: process.env.TWOBTTNS_BASE_URL!,
      game_id: "example-game-0",
      player_id: "example-player",
    }
  );
  console.log("Example 2bttns play URL: ", data);
}
```

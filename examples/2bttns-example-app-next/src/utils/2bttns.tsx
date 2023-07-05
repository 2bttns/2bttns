import TwoBttns, { ApiResponses } from "@2bttns/sdk";

export const twobttns = new TwoBttns({
  appId: process.env.TWOBTTNS_APP_ID,
  secret: process.env.TWOBTTNS_APP_SECRET,
  url: process.env.TWOBTTNS_BASE_URL,
});

export type TwoBttnsPlayer =
  ApiResponses["/players"]["get"]["responses"]["200"]["content"]["application/json"]["players"][number];

export type TwoBttnsTag =
  ApiResponses["/tags"]["get"]["responses"]["200"]["content"]["application/json"]["tags"][number];

export type TwoBttnsRankedOutput =
  ApiResponses["/game-objects/ranked"]["get"]["responses"]["200"]["content"]["application/json"];

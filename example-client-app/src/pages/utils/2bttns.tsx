import TwoBttns, { ApiResponses } from "@2bttns/sdk";

export const twobttns = new TwoBttns({
  appId: "example-app",
  secret: "example-secret-value",
  url: "http://localhost:3001",
});

export type TwoBttnsPlayer =
  ApiResponses["/players"]["get"]["responses"]["200"]["content"]["application/json"]["players"][number];

export type TwoBttnsTag =
  ApiResponses["/tags"]["get"]["responses"]["200"]["content"]["application/json"]["tags"][number];

export type TwoBttnsRankedOutput =
  ApiResponses["/game-objects/ranked"]["get"]["responses"]["200"]["content"]["application/json"];

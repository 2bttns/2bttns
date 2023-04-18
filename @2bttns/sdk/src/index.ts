import jwt from "jsonwebtoken";
import { Fetcher } from "openapi-typescript-fetch";
import { paths } from "../2bttns-api";

export type GeneratePlayURLParams = {
  game_id: string;
  user_id: string;
  num_items?: number | "ALL";
  callback_url?: string;
};

export type TwoBttnsConfig = {
  appId: string; // e.g. Favorite Activities
  secret: string; // e.g. OVTGng6GC4kT2zGINR/brqO1AaVam+EcTvX/74CmzH4=
  url: string; // e.g. "localhost:3001"
};

export type ApiResponses = paths;
export default class TwoBttns {
  appId: string;
  secret: string;
  url: string;
  api: ReturnType<typeof Fetcher.for<paths>>;

  constructor(config: TwoBttnsConfig) {
    const { appId, secret, url } = config;
    this.appId = appId;
    this.secret = secret;
    this.url = url;

    this.api = Fetcher.for<paths>();
    this.api.configure({
      baseUrl: `${url}/api`,
    });

    console.info(`[2bttns] SDK initialized ${secret} ${url}`);
  }

  generateUserToken({ userId }: { userId: string }) {
    const token = jwt.sign(
      { type: "player_token", appId: this.appId, userId },
      this.secret,
      {
        expiresIn: "1h",
      }
    );
    return token;
  }

  decodeUserToken({ token }: { token: string }) {
    const decoded = jwt.verify(token, this.secret);
    const decodedObj = decoded as { userId: string };
    if (!decodedObj.userId) {
      throw new Error("Invalid token: no userId");
    }
    return decodedObj;
  }

  generatePlayUrl(params: GeneratePlayURLParams) {
    const { game_id, user_id, num_items, callback_url } = params;

    const token = this.generateUserToken({ userId: user_id });
    const queryBuilder = new URLSearchParams();
    queryBuilder.append("game_id", game_id);
    queryBuilder.append("app_id", this.appId);
    queryBuilder.append("jwt", token);
    if (num_items) {
      queryBuilder.append("num_items", num_items.toString());
    }

    if (callback_url) {
      queryBuilder.append("callback_url", callback_url);
    }

    return `${this.url}/play?${queryBuilder.toString()}`;
  }
}

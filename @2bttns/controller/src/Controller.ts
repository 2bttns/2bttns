import jwt from "jsonwebtoken";
import { Fetcher } from "openapi-typescript-fetch";
import { paths } from "../2bttns-api";

export type ControllerConfig = {
  appId: string; // e.g. Favorite Activities
  secret: string; // e.g. OVTGng6GC4kT2zGINR/brqO1AaVam+EcTvX/74CmzH4=
  url: string; // e.g. "localhost:3001"
};

export default class Controller {
  appId: string;
  secret: string;
  url: string;
  api: ReturnType<typeof Fetcher.for<paths>>;

  constructor(config: ControllerConfig) {
    const { appId, secret, url } = config;
    this.appId = appId;
    this.secret = secret;
    this.url = url;

    this.api = Fetcher.for<paths>();
    this.api.configure({
      baseUrl: `${url}/api`,
    });

    console.info(`[2bttns] Controller initialized ${secret} ${url}`);
  }

  generateUserToken({ userId }: { userId: string }) {
    const token = jwt.sign({ userId }, this.secret, {
      expiresIn: "1h",
    });
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

  generatePlayUrl({ gameId, userId }: { gameId: string; userId: string }) {
    const token = this.generateUserToken({ userId });
    const queryBuilder = new URLSearchParams();
    queryBuilder.append("game_id", gameId);
    queryBuilder.append("app_id", this.appId);
    queryBuilder.append("jwt", token);
    return `${this.url}/play?${queryBuilder.toString()}`;
  }
}

import { Fetcher } from "openapi-typescript-fetch";
import { paths } from "../2bttns-api";

export type ControllerConfig = {
  secret: string; // e.g. OVTGng6GC4kT2zGINR/brqO1AaVam+EcTvX/74CmzH4=
  url: string; // e.g. "localhost:3001"
};

export default class Controller {
  api: ReturnType<typeof Fetcher.for<paths>>;

  url: string;

  constructor(config: ControllerConfig) {
    const { secret, url } = config;
    this.url = url;

    this.api = Fetcher.for<paths>();
    this.api.configure({
      baseUrl: `${url}/api`,
    });

    console.info(`[2bttns] Controller initialized ${secret} ${url}`);
  }

  async playGame({ gameId, userId }: { gameId: string; userId: string }) {
    if (typeof window === "undefined") {
      throw new Error("Cannot play game on server");
    }

    window.location.href = `${this.url}/play/${gameId}/${userId}`;
  }
}

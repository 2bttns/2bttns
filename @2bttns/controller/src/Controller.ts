import { Fetcher } from "openapi-typescript-fetch";
import { paths } from "../2bttns-api";

export type ControllerConfig = {
  secret: string; // e.g. OVTGng6GC4kT2zGINR/brqO1AaVam+EcTvX/74CmzH4=
  url: string; // e.g. "localhost:3001/api"
};

export default class Controller {
  api: ReturnType<typeof Fetcher.for<paths>>;

  constructor(config: ControllerConfig) {
    const { secret, url } = config;

    this.api = Fetcher.for<paths>();
    this.api.configure({
      baseUrl: url,
    });

    console.info(`[2bttns] Controller initialized ${secret} ${url}`);
  }
}

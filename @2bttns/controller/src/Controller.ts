export type ControllerConfig = {
  secret: string; // e.g. OVTGng6GC4kT2zGINR/brqO1AaVam+EcTvX/74CmzH4=
  url: string; // e.g. "localhost:3001"
};

export default class Controller {
  constructor(config: ControllerConfig) {
    const { secret, url } = config;
    console.log(`[2bttns] Initializing controller: ${secret} ${url}`);
  }
}

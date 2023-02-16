export type ControllerConfig = {
  secret: string;
};

export default class Controller {
  constructor(config: ControllerConfig) {
    const { secret } = config;
    console.log(`Initializing controller with secret: ${secret}`);
  }
}

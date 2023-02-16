export type ControllerConfig = {
    secret: string;
};
export default class Controller {
    constructor(config: ControllerConfig);
}

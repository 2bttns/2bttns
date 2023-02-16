export type ControllerConfig = {
    secret: string;
    url: string;
};
export default class Controller {
    constructor(config: ControllerConfig);
}

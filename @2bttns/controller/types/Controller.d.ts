import { Fetcher } from "openapi-typescript-fetch";
import { paths } from "../2bttns-api";
export type ControllerConfig = {
    secret: string;
    url: string;
};
export default class Controller {
    api: ReturnType<typeof Fetcher.for<paths>>;
    constructor(config: ControllerConfig);
}

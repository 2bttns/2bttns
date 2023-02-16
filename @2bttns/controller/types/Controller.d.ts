import { Fetcher } from "openapi-typescript-fetch";
import { paths } from "../2bttns-api";
export type ControllerConfig = {
    secret: string;
    url: string;
};
export default class Controller {
    api: ReturnType<typeof Fetcher.for<paths>>;
    url: string;
    constructor(config: ControllerConfig);
    playGame({ gameId, userId }: {
        gameId: string;
        userId: string;
    }): Promise<void>;
}

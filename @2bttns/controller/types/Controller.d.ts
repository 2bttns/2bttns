import { Fetcher } from "openapi-typescript-fetch";
import { paths } from "../2bttns-api";
export type ControllerConfig = {
    appId: string;
    secret: string;
    url: string;
};
export default class Controller {
    appId: string;
    secret: string;
    url: string;
    api: ReturnType<typeof Fetcher.for<paths>>;
    constructor(config: ControllerConfig);
    generateUserToken({ userId }: {
        userId: string;
    }): string;
    decodeUserToken({ token }: {
        token: string;
    }): {
        userId: string;
    };
    generatePlayUrl({ gameId, userId }: {
        gameId: string;
        userId: string;
    }): string;
}

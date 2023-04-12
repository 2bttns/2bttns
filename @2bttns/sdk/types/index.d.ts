import { Fetcher } from "openapi-typescript-fetch";
import { paths } from "../2bttns-api";
export type GeneratePlayURLParams = {
    game_id: string;
    user_id: string;
    num_items?: number | "ALL";
    callback_url?: string;
};
export type TwoBttnsConfig = {
    appId: string;
    secret: string;
    url: string;
};
export default class TwoBttns {
    appId: string;
    secret: string;
    url: string;
    api: ReturnType<typeof Fetcher.for<paths>>;
    constructor(config: TwoBttnsConfig);
    generateUserToken({ userId }: {
        userId: string;
    }): string;
    decodeUserToken({ token }: {
        token: string;
    }): {
        userId: string;
    };
    generatePlayUrl(params: GeneratePlayURLParams): string;
}

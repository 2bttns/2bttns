import { Fetcher, OpArgType } from "openapi-typescript-fetch";
import { paths } from "../2bttns-api";
import './fetch-polyfill';
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
export type ApiResponses = paths;
/**
 * **!! Important !! -- The 2bttns SDK is intended for server-side use only.**
 *
 *  It should not be used by client-side code, because API requests are made using an access token generated using an API Key secret
 *  that should not be exposed.
 */
export declare class TwoBttnsApi {
    /**
     * 2bttns App ID corresponding to a 2bttns API Key
     */
    protected appId: string;
    /**
     * API Key secret corresponding to a 2bttns API App ID
     */
    protected secret: string;
    /**
     * URL of the 2bttns Admin Server
     */
    protected url: string;
    /**
     * Access token that is automatically sent with 2bttns API calls via callApi()
     */
    protected apiAccessToken: string;
    /**
     * 2bttns API client generated using openapi-typescript-fetch. Not used directly; instead, use callApi().
     */
    protected api: ReturnType<typeof Fetcher.for<paths>>;
    constructor(config: TwoBttnsConfig);
    /**
     * Make an API call to the 2bttns Admin Server
     * @param path API path name
     * @param method API method name
     * @param args  API method arguments corresponding to the path & method
     * @param init *[optional]* Additional request options -- for example, custom headers. An `Authorization: "Bearer <apiAccessToken>"` header is automatically configured, unless it is overridden here.
     */
    callApi<Path extends keyof ApiResponses, Method extends keyof ApiResponses[Path], Body extends OpArgType<paths[Path][Method]>>(path: Path, method: Method, args?: Body, init?: RequestInit): Promise<import("openapi-typescript-fetch").ApiResponse<200 extends keyof (paths[Path][Method] extends infer T ? T extends paths[Path][Method] ? T extends {
        responses: infer R;
    } ? { [S in keyof R]: R[S] extends {
        schema?: infer S_1 | undefined;
    } ? S_1 : R[S] extends {
        content: {
            'application/json': infer C;
        };
    } ? C : S extends "default" ? R[S] : unknown; } : never : never : never) ? (paths[Path][Method] extends infer T ? T extends paths[Path][Method] ? T extends {
        responses: infer R;
    } ? { [S in keyof R]: R[S] extends {
        schema?: infer S_1 | undefined;
    } ? S_1 : R[S] extends {
        content: {
            'application/json': infer C;
        };
    } ? C : S extends "default" ? R[S] : unknown; } : never : never : never)[keyof (paths[Path][Method] extends infer T ? T extends paths[Path][Method] ? T extends {
        responses: infer R;
    } ? { [S in keyof R]: R[S] extends {
        schema?: infer S_1 | undefined;
    } ? S_1 : R[S] extends {
        content: {
            'application/json': infer C;
        };
    } ? C : S extends "default" ? R[S] : unknown; } : never : never : never) & 200] : 201 extends keyof (paths[Path][Method] extends infer T ? T extends paths[Path][Method] ? T extends {
        responses: infer R;
    } ? { [S in keyof R]: R[S] extends {
        schema?: infer S_1 | undefined;
    } ? S_1 : R[S] extends {
        content: {
            'application/json': infer C;
        };
    } ? C : S extends "default" ? R[S] : unknown; } : never : never : never) ? (paths[Path][Method] extends infer T ? T extends paths[Path][Method] ? T extends {
        responses: infer R;
    } ? { [S in keyof R]: R[S] extends {
        schema?: infer S_1 | undefined;
    } ? S_1 : R[S] extends {
        content: {
            'application/json': infer C;
        };
    } ? C : S extends "default" ? R[S] : unknown; } : never : never : never)[keyof (paths[Path][Method] extends infer T ? T extends paths[Path][Method] ? T extends {
        responses: infer R;
    } ? { [S in keyof R]: R[S] extends {
        schema?: infer S_1 | undefined;
    } ? S_1 : R[S] extends {
        content: {
            'application/json': infer C;
        };
    } ? C : S extends "default" ? R[S] : unknown; } : never : never : never) & 201] : "default" extends keyof (paths[Path][Method] extends infer T ? T extends paths[Path][Method] ? T extends {
        responses: infer R;
    } ? { [S in keyof R]: R[S] extends {
        schema?: infer S_1 | undefined;
    } ? S_1 : R[S] extends {
        content: {
            'application/json': infer C;
        };
    } ? C : S extends "default" ? R[S] : unknown; } : never : never : never) ? (paths[Path][Method] extends infer T ? T extends paths[Path][Method] ? T extends {
        responses: infer R;
    } ? { [S in keyof R]: R[S] extends {
        schema?: infer S_1 | undefined;
    } ? S_1 : R[S] extends {
        content: {
            'application/json': infer C;
        };
    } ? C : S extends "default" ? R[S] : unknown; } : never : never : never)[keyof (paths[Path][Method] extends infer T ? T extends paths[Path][Method] ? T extends {
        responses: infer R;
    } ? { [S in keyof R]: R[S] extends {
        schema?: infer S_1 | undefined;
    } ? S_1 : R[S] extends {
        content: {
            'application/json': infer C;
        };
    } ? C : S extends "default" ? R[S] : unknown; } : never : never : never) & "default"] : unknown>>;
    /**
     * Generate a URL that can be used to send a user to 2bttns to play a game.
     *
     * This URL should be generated on the server-side of your application, and then used on the server or client-side to redirect the user to 2bttns.
     */
    generatePlayUrl(params: GeneratePlayURLParams, expiresIn?: string): string;
    /**
     * Generate a JWT token for a user who should be sent to 2bttns to play a game.
     * @param expiresIn *[optional]* How long the token should be valid for. Defaults to "1h".
     */
    static generatePlayerToken(params: {
        appId: string;
        secret: string;
        userId: string;
        expiresIn: string;
    }): string;
    /**
     * Decode a JWT token that was generated by generatePlayerToken()
     */
    static decodeUserToken(params: {
        token: string;
        secret: string;
    }): {
        type: string;
        userId: string;
    };
    /**
     * Generate an API access token JWT for a given API Key
     */
    static generateApiAccessToken(params: {
        appId: string;
        secret: string;
    }): string;
}

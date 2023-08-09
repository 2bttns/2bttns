// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const server = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string() : z.string().url()
  ),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  SERVER_LOG_LEVEL: z.string().optional(),
  SERVER_LOG_LOCALE: z.string().optional(),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const client = z.object({
  // NEXT_PUBLIC_CLIENTVAR: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * edge runtimes (e.g. middlewares) or client-side so we need to destruct manually.
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  SERVER_LOG_LEVEL: process.env.SERVER_LOG_LEVEL,
  SERVER_LOG_LOCALE: process.env.SERVER_LOG_LOCALE,
};

// Don't touch the part below
// --------------------------
const merged = server.merge(client);
/** @type z.infer<merged>
 *  @ts-ignore - can't type this properly in jsdoc */
let env;

if (!process.env.SKIP_ENV_VALIDATION) {
  const formatErrors = (
    /** @type {z.ZodFormattedError<Map<string,string>,string>} */
    errors
  ) =>
    Object.entries(errors)
      .map(([name, value]) => {
        if (value && "_errors" in value)
          return `${name}: ${value._errors.join(", ")}\n`;
      })
      .filter(Boolean);

  const isServer = typeof window === "undefined";

  const parsed = isServer
    ? merged.safeParse(processEnv) // on server we can validate all env vars
    : client.safeParse(processEnv); // on client we can only validate the ones that are exposed

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:\n",
      ...formatErrors(parsed.error.format())
    );
    throw new Error("Invalid environment variables");
  }

  /** @type z.infer<merged>
   *  @ts-ignore - can't type this properly in jsdoc */
  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_")) {
        console.log(env);
        throw new Error(
          `❌ Attempted to access server-side environment variable '${prop}' on the client`
        );
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - can't type this properly in jsdoc
      return target[prop];
    },
  });
} else {
  /** @type z.infer<merged>
   *  @ts-ignore - can't type this properly in jsdoc */
  env = processEnv;
}

export { env };

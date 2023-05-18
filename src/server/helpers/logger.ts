import winston from "winston";
import { env } from "../../env/server.mjs";

const logLevel =
  (env.SERVER_LOG_LEVEL as keyof (typeof config)["levels"]) ?? "info";
const locale = env.SERVER_LOG_LOCALE ?? "en-US";

const config = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "blue",
    http: "green",
    verbose: "cyan",
    debug: "magenta",
    silly: "gray",
  },
};
winston.addColors(config.colors);

function wLogger(input: {
  logName: string;
  level: keyof (typeof config)["levels"];
}): winston.Logger {
  const { logName, level } = input;

  return winston.createLogger({
    levels: config.levels,
    level: `${level}`,
    transports: configureTransports(logName, level),
  });
}

function configureTransports(logName: string, level: string) {
  return [
    new winston.transports.Console({
      level: `${level}`,

      format: winston.format.combine(
        customPrintf(),
        winston.format.colorize({ all: true })
      ),
    }),
    // @TODO: Re-enable file logging when we figure out how to make it work with deployment platforms like Vercel
    // new winston.transports.File({
    //   filename: `./src/logs/${logName}/${logName}-error.log`,
    //   level: "error",
    //   format: customPrintf(),
    // }),
    // new winston.transports.File({
    //   filename: `./src/logs/${logName}/${logName}-warn.log`,
    //   level: "warn",
    //   format: customPrintf(),
    // }),
    // new winston.transports.File({
    //   filename: `./src/logs/${logName}/${logName}-all.log`,
    //   level: "silly",
    //   format: customPrintf(),
    // }),

    // new winston.transports.File({
    //   format: customPrintf(),
    //   filename: "./src/logs/global.log",
    //   level: "silly",
    // }),
  ];
}

function customPrintf(): winston.Logform.Format {
  return winston.format.printf(
    (info) =>
      `[${new Date().toLocaleDateString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}] [${info.level.toLocaleUpperCase()}]: ${info.message}`
  );
}

export const logger = wLogger({
  level: logLevel,
  logName: "2bttns",
});

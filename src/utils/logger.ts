import winston from "winston";
import path from "path";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Tell winston about the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let metaString = "";
    if (Object.keys(meta).length > 0) {
      metaString = "\n" + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaString}`;
  }),
);

// Define which transports the logger must use
const transports = [
  // Console transport - always enabled for development visibility
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), format),
  }),
];

// Add file transports only in non-test environments
if (process.env.NODE_ENV !== "test") {
  transports.push(
    // File transport for errors
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      format: winston.format.combine(winston.format.uncolorize(), winston.format.json()),
    }) as any,
    // File transport for all logs
    new winston.transports.File({
      filename: path.join("logs", "all.log"),
      format: winston.format.combine(winston.format.uncolorize(), winston.format.json()),
    }) as any,
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  levels,
  format,
  transports,
  exitOnError: false,
});

export default logger;

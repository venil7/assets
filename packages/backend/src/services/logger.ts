// Structured logging service for production observability
// All logs are output as JSON for easy parsing by log aggregation tools

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL = (process.env.LOG_LEVEL || "info") as LogLevel;
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Structured logger that outputs JSON for log aggregation
 * Usage:
 *   logger.info("User logged in", { userId: user.id, username: user.username })
 *   logger.error("Database connection failed", dbError, { retries: 3 })
 */
export const logger = {
  debug: (msg: string, meta?: Record<string, any>) => {
    if (LOG_LEVELS["debug"] >= LOG_LEVELS[LOG_LEVEL]) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "DEBUG",
          message: msg,
          ...meta,
        })
      );
    }
  },

  info: (msg: string, meta?: Record<string, any>) => {
    if (LOG_LEVELS["info"] >= LOG_LEVELS[LOG_LEVEL]) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "INFO",
          message: msg,
          ...meta,
        })
      );
    }
  },

  warn: (msg: string, meta?: Record<string, any>) => {
    if (LOG_LEVELS["warn"] >= LOG_LEVELS[LOG_LEVEL]) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          message: msg,
          ...meta,
        })
      );
    }
  },

  error: (msg: string, error?: Error, meta?: Record<string, any>) => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        message: msg,
        error: error?.message,
        stack: error?.stack,
        ...meta,
      })
    );
  },
};

/**
 * Get the current log level
 */
export const getLogLevel = (): LogLevel => LOG_LEVEL;

/**
 * Check if a log level is enabled
 */
export const isLogLevelEnabled = (level: LogLevel): boolean =>
  LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL];

import { Config } from "./config";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private level: LogLevel = "info";

  configure(config: Pick<Config, "LOG_LEVEL">) {
    this.level = config.LOG_LEVEL;
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log("debug", message, data);
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log("info", message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log("warn", message, data);
  }

  error(message: string, data?: Record<string, unknown>) {
    this.log("error", message, data);
  }

  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
  ) {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.level]) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data,
    };

    const output = JSON.stringify(entry);
    if (level === "error") {
      console.error(output);
    } else {
      console.log(output);
    }
  }
}

export const logger = new Logger();

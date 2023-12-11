import { getUrlForPath } from "utils/api";
import { getTokenHolder } from "@kartverket/frontend-aut-lib/dist/authService";

const useRemoteLogging = import.meta.env["VITE_USE_REMOTE_LOGGING"];

type LogLevels = "INFO" | "WARN" | "ERROR";

class FrontendLogger {
  info = (message: string, stacktrace?: string) => {
    // eslint-disable-next-line no-console
    console.log(message, stacktrace);
    this.logRemote(message, "INFO", stacktrace);
  };

  warn = (message: string, stacktrace?: string) => {
    // eslint-disable-next-line no-console
    console.warn(message, stacktrace);
    this.logRemote(message, "WARN", stacktrace);
  };

  error = (message: string, stacktrace: string | null | undefined) => {
    // eslint-disable-next-line no-console
    console.error(message, stacktrace);
    this.logRemote(message, "ERROR", stacktrace);
  };

  private logRemote = (
    message: string,
    level: LogLevels,
    stacktrace: string | null | undefined,
  ) => {
    if (useRemoteLogging != "true") return;

    const token = getTokenHolder()?.token;
    fetch(getUrlForPath("/v1/frontendlogger"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        logLevel: level,
        stacktrace,
      }),
    });
  };
}

const frontendLogger = new FrontendLogger();

export default frontendLogger;

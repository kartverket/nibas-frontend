import { getUrlForPath } from "utils/api";
import { getTokenHolder } from "@kartverket/frontend-aut-lib/dist/authService";

const useRemoteLogging = import.meta.env["VITE_USE_REMOTE_LOGGING"];

type LogLevels = "INFO" | "WARN" | "ERROR";

class FrontendLogger {
  info = (message: string, error?: Error) => {
    // eslint-disable-next-line no-console
    console.log(message, error);
    this.logRemote(message, "INFO", error);
  };

  warn = (message: string, error?: Error) => {
    // eslint-disable-next-line no-console
    console.warn(message, error);
    this.logRemote(message, "INFO", error);
  };

  error = (message: string, error?: Error) => {
    // eslint-disable-next-line no-console
    console.error(message, error);
    this.logRemote(message, "INFO", error);
  };

  private logRemote = (message: string, level: LogLevels, error?: Error) => {
    if (!useRemoteLogging) return;

    const token = getTokenHolder()?.token;
    fetch(getUrlForPath("/v1/frontendlogger"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };
}

const frontendLogger = new FrontendLogger();

export default frontendLogger;

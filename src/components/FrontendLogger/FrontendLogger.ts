import { getUrlForPath } from "utils/api";

type LogLevels = "INFO" | "WARN" | "ERROR";

class FrontendLogger {
  info = (message: string, error?: Error, authToken?: string | null) => {
    // eslint-disable-next-line no-console
    console.log(message, error);
    this.logRemote(message, "INFO", error, authToken);
  };

  warn = (message: string, error?: Error, authToken?: string | null) => {
    // eslint-disable-next-line no-console
    console.warn(message, error);
    this.logRemote(message, "WARN", error, authToken);
  };

  error = (message: string, error: Error | null | undefined, authToken?: string | null) => {
    // eslint-disable-next-line no-console
    console.error(message, error);
    this.logRemote(message, "ERROR", error, authToken);
  };

  private logRemote = async (
    message: string,
    level: LogLevels,
    error: Error | null | undefined,
    authToken?: string | null,
  ) => {
    // NOOP
  };

  private sendLogToRemote = (
    message: string,
    level: LogLevels,
    stacktrace: string | null | undefined,
    authToken?: string | null,
  ) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken != null && authToken !== "") {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    fetch(getUrlForPath("/v1/frontendlogger"), {
      method: "POST",
      headers: headers,
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

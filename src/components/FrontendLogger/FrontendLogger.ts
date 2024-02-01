import { getUrlForPath } from "utils/api";
import { getTokenHolder } from "@kartverket/frontend-aut-lib/dist/authService";
import StackTrace from "stacktrace-js";

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
        this.logRemote(message, "WARN", error);
    };

    error = (message: string, error: Error | null | undefined) => {
        // eslint-disable-next-line no-console
        console.error(message, error);
        this.logRemote(message, "ERROR", error);
    };

    private logRemote = async (message: string, level: LogLevels, error: Error | null | undefined) => {
        if (error == null) {
            this.sendLogToRemote(message, level, null);
        } else {
            const parsedStackFrames = await StackTrace.fromError(error);
            this.sendLogToRemote(message, level, parsedStackFrames.map((frame) => frame.toString()).join("\n  "));
        }
    };

    private sendLogToRemote = (message: string, level: LogLevels, stacktrace: string | null | undefined) => {
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

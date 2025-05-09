import { setupServer } from "msw/node";
import { handlers } from "./handlers/handlers";

// This configures a request mocking server with the given request handlers.
// @ts-expect-error workaround for MSW private __kind mismatch
export const server = setupServer(...handlers);

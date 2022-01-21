import type { RestHandler } from "msw";
import { geonorgeHandlers } from "./geonorgeHandlers";
import { nibasApiHandlers } from "./nibasApiHandlers";
import { proxyHandlers } from "./proxyHandlers";

export const handlers: RestHandler[] = [
  ...nibasApiHandlers,
  ...geonorgeHandlers,
  ...proxyHandlers,
];

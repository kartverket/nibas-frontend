import { HttpHandler } from "msw";
import { geonorgeHandlers } from "./geonorgeHandlers";
import { nibasApiHandlers } from "./nibasApiHandlers";
import { proxyHandlers } from "./proxyHandlers";

export const handlers: HttpHandler[] = [
  ...nibasApiHandlers,
  ...geonorgeHandlers,
  ...proxyHandlers,
];

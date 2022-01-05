import type { RestHandler } from "msw";
import { geonorgeHandlers } from "./geonorgeHandlers";
import { nibasApiHandlers } from "./nibasApiHandlers";

export const handlers: RestHandler[] = [
  ...nibasApiHandlers,
  ...geonorgeHandlers,
];

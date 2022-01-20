import { rest } from "msw";
import type { RestHandler } from "msw";
import { mockBasicGrense, mockFylker, mockKommuner } from "./responses";

export const nibasApiHandlers: RestHandler[] = [
  rest.get("/v1/fylker", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockFylker));
  }),
  rest.get("/v1/kommuner", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockKommuner));
  }),
  rest.get("v1/kommuner/:id/grenser", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockBasicGrense));
  }),
  rest.get("/v1/fylker/:fylkeId/grenser", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockBasicGrense));
  }),
];

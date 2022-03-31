import { rest } from "msw";
import type { RestHandler } from "msw";
import {
  mockGeoJsonFeatureResponse,
  mockFylker,
  mockKommuner,
  mockMaalemetodeKode,
} from "./responses";

export const nibasApiHandlers: RestHandler[] = [
  rest.get("/v1/fylker", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockFylker));
  }),
  rest.get("/v1/kommuner", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockKommuner));
  }),
  rest.get("v1/kommuner/:id/grenser", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockGeoJsonFeatureResponse));
  }),
  rest.get("/v1/fylker/:fylkeId/grenser", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockGeoJsonFeatureResponse));
  }),
  rest.get("/v1/kodeliste/maalemetode-koder", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockMaalemetodeKode]));
  }),
  rest.post("/v1/grenser", (req, res, ctx) => {
    return res(ctx.status(200));
  }),
];

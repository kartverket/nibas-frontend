import { rest } from "msw";
import type { RestHandler } from "msw";
import {
  mockGeoJsonFeatureResponse,
  mockFylker,
  mockKommuner,
  mockMaalemetodeResponse,
  mockActuatorResponse,
  mockNoeyaktighetsklasseResponse,
  mockTerrengdetaljResponse,
  mockDetailedKommune,
  mockDetailedGrunnkrets1,
  mockGrunnkrets1,
  mockGrunnkrets2,
  mockDetailedGrunnkrets2,
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
    return res(ctx.status(200), ctx.json(mockMaalemetodeResponse));
  }),
  rest.post("/v1/grenser", (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.get("/actuator/info", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockActuatorResponse));
  }),
  rest.get("/v1/kodeliste/terrengdetaljkoder", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockTerrengdetaljResponse));
  }),
  rest.get("/v1/kodeliste/noeyaktighetsklasser", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockNoeyaktighetsklasseResponse));
  }),
  rest.get("/v1/kommuner/:id", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockDetailedKommune));
  }),
  rest.get("/v1/grunnkretser", (req, res, ctx) => {
    const kommunenummer = req.url.searchParams
      .get("kommunenummer")
      ?.toLowerCase();

    if (kommunenummer === "a379eb0a-7bae-4fc9-ab07-cf0c7a28bdb7") {
      return res(ctx.status(200), ctx.json([mockGrunnkrets1, mockGrunnkrets2]));
    }

    return res(ctx.status(200), ctx.json([]));
  }),
  rest.get("/v1/grunnkretser/1", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockDetailedGrunnkrets1));
  }),
  rest.get("/v1/grunnkretser/2", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockDetailedGrunnkrets2));
  }),
];

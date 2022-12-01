import { rest } from "msw";
import type { RestHandler } from "msw";
import * as mocks from "./responses";
import {
  ConflictResponseWrapper,
  GrunnkretsResponse,
  StemmekretsResponse,
  UtkastRef,
  UtkastResponse,
} from "types/api";

export const nibasApiHandlers: RestHandler[] = [
  rest.get("/v1/fylker", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mocks.mockFylker));
  }),
  rest.get("/v1/kommuner", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mocks.mockKommuner));
  }),
  rest.get("v1/kommuner/:id/grenser", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mocks.mockGeoJsonFeatureResponse));
  }),
  rest.get("/v1/fylker/:fylkeId/grenser", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mocks.mockGeoJsonFeatureResponse));
  }),
  rest.get("/v1/kodeliste/maalemetode-koder", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mocks.mockMaalemetodeResponse));
  }),
  rest.post("/v1/grenser", (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.get("/actuator/info", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mocks.mockActuatorResponse));
  }),
  rest.get("/v1/kodeliste/terrengdetaljkoder", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mocks.mockTerrengdetaljResponse));
  }),
  rest.get("/v1/kodeliste/noeyaktighetsklasser", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mocks.mockNoeyaktighetsklasseResponse)
    );
  }),
  rest.get("/v1/kommuner/:id", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mocks.mockDetailedKommune));
  }),
  rest.get("/v1/kommuner/:id/grunnkretser", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([mocks.mockGrunnkrets1, mocks.mockGrunnkrets2])
    );
  }),
  rest.get("/v1/grunnkretser/1", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mocks.mockDetailedGrunnkrets1));
  }),
  rest.get("/v1/grunnkretser/2", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mocks.mockDetailedGrunnkrets2));
  }),
  rest.get("/v1/kommuner/:id/stemmekretser", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mocks.mockStemmekretser));
  }),
  rest.get("/v1/stemmekretser/1", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mocks.mockStemmekrets1));
  }),
  rest.get("/v1/stemmekretser/2", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mocks.mockStemmekrets2));
  }),
  rest.post("/v1/utkast", (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: "1" }));
  }),
  rest.get("/v1/utkast/1", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json<UtkastResponse>(mocks.mockUtkast));
  }),
  rest.get("/v1/utkast", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<UtkastRef[]>([mocks.mockUtkastRef1, mocks.mockUtkastRef2])
    );
  }),
  rest.post("/v1/utkast/1/publiser", (req, res, ctx) => {
    const scenario = req.url.searchParams.get("scenario");

    // Sad path
    if (scenario === "conflict") {
      return res(
        ctx.status(409),
        ctx.json<ConflictResponseWrapper>({
          httpStatus: "409 CONFLICT",
          optimisticLockExceptions: [],
          framtidigVersjonConflict: mocks.mockFremtidigEndringConflictResponse,
        })
      );
    }

    // Happy path
    return res(ctx.status(200));
  }),
  rest.get("/v1/grunnkretser/1/framtidigeversjoner", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<GrunnkretsResponse[]>(mocks.mockGrunnkretserFramtidigeEndringer)
    );
  }),
  rest.get("/v1/stemmekretser/1/framtidigeversjoner", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<StemmekretsResponse[]>(
        mocks.mockStemmekretserFramtidigeEndringer
      )
    );
  }),
];

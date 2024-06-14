import { HttpHandler, HttpResponse, http } from "msw";
import * as mocks from "./responses";
import { GrunnkretsResponse, StemmekretsResponse, UtkastRef, UtkastResponse } from "types/api";
import { mockUtkast, mockUtkastIngenEndringer } from "./responses";

export const nibasApiHandlers: HttpHandler[] = [
  http.get("/v1/fylker", () => HttpResponse.json(mocks.mockFylker, { status: 200 })),
  http.get("/v1/kommuner", () => HttpResponse.json(mocks.mockKommuner, { status: 200 })),
  http.get("v1/kommuner/:id/grenser", () => HttpResponse.json(mocks.mockGeoJsonFeatureResponse, { status: 200 })),
  http.get("/v1/fylker/:fylkeId/grenser", () => HttpResponse.json(mocks.mockGeoJsonFeatureResponse, { status: 200 })),
  http.get("/v1/kodeliste/maalemetode-koder", () => HttpResponse.json(mocks.mockMaalemetodeResponse, { status: 200 })),
  http.post("/v1/grenser", () => new HttpResponse(null, { status: 200 })),
  http.get("/v1/kommuner/:id", () => HttpResponse.json(mocks.mockKommune, { status: 200 })),
  http.get("/v1/kommuner/:id/grunnkretser", () => {
    return HttpResponse.json([mocks.mockDetailedGrunnkrets1, mocks.mockDetailedGrunnkrets2], {
      status: 200,
    });
  }),
  http.get("/v1/grunnkretser/1", () => HttpResponse.json(mocks.mockDetailedGrunnkrets1, { status: 200 })),
  http.get("/v1/grunnkretser/2", () => HttpResponse.json(mocks.mockDetailedGrunnkrets2, { status: 200 })),
  http.get("/v1/kommuner/:id/stemmekretser", () => HttpResponse.json(mocks.mockStemmekretser, { status: 200 })),
  http.get("/v1/stemmekretser/1", () => HttpResponse.json(mocks.mockStemmekrets1, { status: 200 })),
  http.get("/v1/stemmekretser/2", () => HttpResponse.json(mocks.mockStemmekrets2, { status: 200 })),
  http.post("/v1/utkast", () => HttpResponse.json({ id: "1" }, { status: 201 })),
  http.get("/v1/utkast/1", () => HttpResponse.json<UtkastResponse>(mocks.mockUtkast, { status: 200 })),
  http.get(`/v1/utkast/${mockUtkast.id}`, () => HttpResponse.json<UtkastResponse>(mocks.mockUtkast, { status: 200 })),
  http.get(`/v1/utkast/${mockUtkastIngenEndringer.id}`, () =>
    HttpResponse.json<UtkastResponse>(mocks.mockUtkastIngenEndringer, { status: 200 }),
  ),
  http.get("/v1/utkast", () =>
    HttpResponse.json<UtkastRef[]>([mocks.mockUtkastRef1, mocks.mockUtkastRef2], {
      status: 200,
    }),
  ),
  http.post("/v1/utkast/1/publiser", () => new HttpResponse(null, { status: 200 })),
  http.get("/v1/grunnkretser/1/framtidigeversjoner", () =>
    HttpResponse.json<GrunnkretsResponse[]>(mocks.mockGrunnkretserFramtidigeEndringer, {
      status: 200,
    }),
  ),
  http.get("/v1/stemmekretser/1/framtidigeversjoner", () =>
    HttpResponse.json<StemmekretsResponse[]>(mocks.mockStemmekretserFramtidigeEndringer, {
      status: 200,
    }),
  ),
];

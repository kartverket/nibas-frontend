import { HttpHandler, HttpResponse, http } from "msw";

export const proxyHandlers: HttpHandler[] = [
    http.get("/skbaatts/req", () => new HttpResponse("ABC123", { status: 200 })),
    http.get("/skwms1/wms.matrikkel.v1", () => new HttpResponse(null, { status: 501 })),
    http.get("/skwms1/wms.nib", () => new HttpResponse(null, { status: 501 })),
    http.get("/skwms1/wms.ecc_enc", () => new HttpResponse(null, { status: 501 })),
];

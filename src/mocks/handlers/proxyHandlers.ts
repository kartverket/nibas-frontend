import { rest } from "msw";
import type { RestHandler } from "msw";

export const proxyHandlers: RestHandler[] = [
  rest.get("/skbaatts/req", (req, res, ctx) =>
    res(ctx.status(200), ctx.text("ABC123")),
  ),
  rest.get("/skwms1/wms.nib", (req, res, ctx) => res(ctx.status(501))),
  rest.get("/skwms1/wms.ecc_enc", (req, res, ctx) => res(ctx.status(501))),
];

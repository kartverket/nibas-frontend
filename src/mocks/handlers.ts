import { rest } from "msw";
import type { RestHandler } from "msw";

export const handlers: RestHandler[] = [
  rest.get("/v1/administrativ-enhet", (req, res, ctx) => {
    const type = req.url.searchParams.get("type");

    if (!type) {
      return res(ctx.status(500));
    }

    if (type.toUpperCase() === "FYLKE") {
      return res(
        ctx.status(200),
        ctx.json([
          { type: "FYLKE", id: 1, navn: "Viken", nummer: "30" },
          { type: "FYLKE", id: 2, navn: "Innlandet", nummer: "34" },
        ])
      );
    } else if (type.toUpperCase() === "KOMMUNE") {
      return res(
        ctx.status(200),
        ctx.json([
          { type: "KOMMUNE", id: 1, navn: "Ringerike", nummer: "3007" },
          { type: "KOMMUNE", id: 2, navn: "Hole", nummer: "3038" },
        ])
      );
    }
  }),
];

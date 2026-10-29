import { handleNyGrense } from "contexts/HistoryContext/history-utils";
import { isTempFeatureId } from "pages/Kart/interactions/feature-id-utils";
import { FeatureCollection, FeatureProperties, KontekstEgenskaper, Metadata } from "types/api";
import { describe, expect, it } from "vitest";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import {
  andreGrensetyperISosiFil,
  lagBopliktomraadegrenserFraSosi,
  lagNyGrenseEndringer,
} from "./importer-sosi-grenser";

const tilhorighet: KontekstEgenskaper = {
  id: undefined,
  kommuneId: { lokalid: { value: "kommune-1" }, gyldighetsdato: "2026-11-01" },
  kretsNummer: "02",
  type: "BOPLIKTOMRAADE",
  version: 1,
};

// Slik /v1/kartlag/upload svarer: id og grensetype fra fila
const lagOpplastet = (grensetyper: string[]) =>
  ({
    type: "FeatureCollection",
    features: grensetyper.map((grensetype, n) => ({
      type: "Feature",
      id: `${n}`,
      geometry: {
        type: "LineString",
        coordinates: [
          [308515.5, 6985645],
          [308520, 6985650.5],
        ],
      },
      properties: { type: grensetype, srid: 25833, version: 1, kontekstEgenskaper: [], shouldArchive: false },
    })),
  }) as unknown as FeatureCollection;

const opplastet = lagOpplastet(["Bopliktområdegrense", "Bopliktområdegrense"]);

describe("andreGrensetyperISosiFil", () => {
  it("godtar en fil med bare bopliktområdegrenser", () => {
    expect(andreGrensetyperISosiFil(opplastet)).toEqual([]);
  });

  it("finner hver annen grensetype i fila én gang", () => {
    const blandet = lagOpplastet(["Bopliktområdegrense", "Kommunegrense", "Grunnkretsgrense", "Kommunegrense"]);

    expect(andreGrensetyperISosiFil(blandet)).toEqual(["Kommunegrense", "Grunnkretsgrense"]);
  });
});

describe("lagBopliktomraadegrenserFraSosi", () => {
  it("lager nye bopliktområdegrenser med tilhørighet og valgt målemetode", () => {
    const grenser = lagBopliktomraadegrenserFraSosi(opplastet, { tilhorighet, maalemetodeId: "maalemetode-1" });

    expect(grenser).toHaveLength(2);
    grenser.forEach((grense) => {
      const properties = grense.getProperties() as FeatureProperties;
      expect(isTempFeatureId(grense.getId())).toBe(true);
      expect(properties.type).toBe("Bopliktområdegrense");
      expect(properties.kontekstEgenskaper).toEqual([tilhorighet]);
      expect((properties.metadata as Metadata).commonGrense?.posisjonskvalitet?.maalemetode.id).toBe("maalemetode-1");
    });
    expect(new Set(grenser.map((grense) => grense.getId())).size).toBe(2);
  });
});

describe("lagNyGrenseEndringer", () => {
  it("beholder valgt målemetode og tilhørighet når importen angres og gjøres om", () => {
    const grenser = lagBopliktomraadegrenserFraSosi(opplastet, { tilhorighet, maalemetodeId: "maalemetode-1" });
    addFeaturesToSource("edit", grenser);
    const entry = { type: "nygrense" as const, changes: lagNyGrenseEndringer(grenser) };

    handleNyGrense(entry, "from");
    handleNyGrense(entry, "to");

    grenser.forEach((grense) => {
      const metadata = grense.get("metadata") as Metadata;
      expect(metadata.commonGrense?.posisjonskvalitet?.maalemetode.id).toBe("maalemetode-1");
      expect(grense.get("kontekstEgenskaper")).toEqual([tilhorighet]);
    });
    removeFeaturesFromSourceByIds(
      "edit",
      grenser.map((grense) => `${grense.getId()}`),
    );
  });
});

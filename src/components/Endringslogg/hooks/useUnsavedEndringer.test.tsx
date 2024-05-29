import { describe, expect } from "vitest";
import { PropsWithChildren } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import {
  GrenseArkiveringsEntry,
  GrenseDelingEntry,
  GrenseEntry,
  GrenseTilhorighetEntry,
  HistoryEntry,
  KommuneEntry,
  KretsdelingEntry,
  NyGrenseEntry,
  PropertyEntry,
  StemmekretsEntry,
} from "contexts/HistoryContext/types";
import { HistoryProvider } from "contexts/HistoryContext/HistoryContext";
import { useUnsavedEndringer } from "components/Endringslogg/hooks/useUnsavedEndringer";
import { getDefaultFeatureProperties } from "utils/features";
import { FeatureProperties, KretsDelingEndringRequest } from "../../../types/api";
import { mockStemmekrets1 } from "../../../mocks/handlers/responses";
import { Feature } from "ol";
import { MockAuthProvider } from "../../../mocks/contexts/AuthContextMock";

describe("useUnsavedEndringer", () => {
  describe("kretsendringer", () => {
    it("skal returnere hvor mange nye grenser som er på history", () => {
      const entries = [createNyGrenseHistoryEntry("id1"), createNyGrenseHistoryEntry("id2")];
      const { result } = renderHookWithHistory(entries);

      expect(result.current.harEndringer).toBeTruthy;
      expect(result.current.kretsendringer.antallNyeGrenser).toBe(2);
    });

    it("nye grenser skal inkludere nye grenser fra en grensedeling", () => {
      const entries = [
        createNyGrenseHistoryEntry("id1"),
        createNyGrenseHistoryEntry("id2"),
        createGrensedelingHistoryEntry("id3", ["delt1", "delt2"]),
      ];
      const { result } = renderHookWithHistory(entries);

      expect(result.current.harEndringer).toBeTruthy;
      expect(result.current.kretsendringer.antallNyeGrenser).toBe(4);
    });

    it("skal returnere hvor mange arkiverte grenser som er på history", () => {
      const entries = [createArchivedGrenseHistoryEntry("id1"), createArchivedGrenseHistoryEntry("id2")];
      const { result } = renderHookWithHistory(entries);

      expect(result.current.harEndringer).toBeTruthy;
      expect(result.current.kretsendringer.antallArkiverteGrenser).toBe(2);
    });

    it("arkiverte grenser skal inkluderer grenser som er akivert i forbindelse med en grensedeling", () => {
      const entries = [
        createArchivedGrenseHistoryEntry("id1"),
        createArchivedGrenseHistoryEntry("id2"),
        createGrensedelingHistoryEntry("id3", ["delt1", "delt2"]),
      ];
      const { result } = renderHookWithHistory(entries);

      expect(result.current.harEndringer).toBeTruthy;
      expect(result.current.kretsendringer.antallArkiverteGrenser).toBe(3);
    });

    it("skal returnere hvor mange grenser som har endringer på history", () => {
      const entries = [createEditedGrenseHistoryEntry("id1"), createEditedGrenseHistoryEntry("id2")];
      const { result } = renderHookWithHistory(entries);

      expect(result.current.harEndringer).toBeTruthy;
      expect(result.current.kretsendringer.antallEndredeGrenser).toBe(2);
    });

    it("flere endringer på samme grense skal kun telles 1 gang", () => {
      const entries = [
        createEditedGrenseHistoryEntry("id1"),
        createEditedGrenseHistoryEntry("id2"),
        createEditedGrenseHistoryEntry("id1"),
      ];
      const { result } = renderHookWithHistory(entries);

      expect(result.current.harEndringer).toBeTruthy;
      expect(result.current.kretsendringer.antallEndredeGrenser).toBe(2);
    });

    it("grenseendringer skal inkludere endringer på koordinater, featureproperties og tilhørigheter", () => {
      const entries = [
        createEditedGrenseHistoryEntry("id1"),
        createEditedGrenseTilhorigheterHistoryEntry("id2"),
        createEditedGrensePropertiesHistoryEntry("id3"),
      ];
      const { result } = renderHookWithHistory(entries);

      expect(result.current.harEndringer).toBeTruthy;
      expect(result.current.kretsendringer.antallEndredeGrenser).toBe(3);
    });

    it("skal summere opp flere ulike typer endringer i antall endringer", () => {
      const entries = [
        createArchivedGrenseHistoryEntry("id1"),
        createArchivedGrenseHistoryEntry("id2"),
        createEditedGrenseHistoryEntry("id3"),
        createEditedGrenseHistoryEntry("id4"),
        createNyGrenseHistoryEntry("id5"),
        createNyGrenseHistoryEntry("id6"),
      ];
      const { result } = renderHookWithHistory(entries);

      expect(result.current.harEndringer).toBeTruthy;
      expect(result.current.antallEndringer).toBe(6);
    });

    it("skal returnere alle metadataendringer som er gjort", () => {
      const entries = [
        createMetadataendringHistoryEntry(
          "id1",
          { navn: "gammelt navn1", nummer: "11" },
          { navn: "nytt navn1", nummer: "12" },
        ),
        createMetadataendringHistoryEntry(
          "id2",
          { navn: "gammelt navn2", nummer: "21" },
          { navn: "nytt navn2", nummer: "22" },
        ),
      ];
      const { result } = renderHookWithHistory(entries);

      expect(result.current.harEndringer).toBeTruthy;
      expect(result.current.kretsendringer.metadataendringer.length).toBe(2);

      const endring1 = result.current.kretsendringer.metadataendringer.find(
        (endring) => endring.opprinneligKrets.navn === "gammelt navn1",
      );
      const endring2 = result.current.kretsendringer.metadataendringer.find(
        (endring) => endring.opprinneligKrets.navn === "gammelt navn2",
      );

      expect(endring1?.opprinneligKrets.navn).toBe("gammelt navn1");
      expect(endring1?.opprinneligKrets.nummer).toBe("11");
      expect(endring1?.navn).toBe("nytt navn1");
      expect(endring1?.nummer).toBe("12");

      expect(endring2?.opprinneligKrets.navn).toBe("gammelt navn2");
      expect(endring2?.opprinneligKrets.nummer).toBe("21");
      expect(endring2?.navn).toBe("nytt navn2");
      expect(endring2?.nummer).toBe("22");
    });

    it("metadataendringer på samme krets skal slåes sammen til 1 endring", () => {
      const entries = [
        createMetadataendringHistoryEntry(
          "id1",
          { navn: "gammelt navn1", nummer: "11" },
          { navn: "nytt navn1", nummer: "12" },
        ),
        createMetadataendringHistoryEntry(
          "id1",
          { navn: "nytt navn1", nummer: "12" },
          { navn: "nytt navn2", nummer: "13" },
        ),
        createMetadataendringHistoryEntry(
          "id1",
          { navn: "nytt navn2", nummer: "13" },
          { navn: "nytt navn3", nummer: "14" },
        ),
      ];
      const { result } = renderHookWithHistory(entries);

      expect(result.current.harEndringer).toBeTruthy;
      expect(result.current.kretsendringer.metadataendringer.length).toBe(1);

      const endring1 = result.current.kretsendringer.metadataendringer[0];
      expect(endring1?.opprinneligKrets.navn).toBe("gammelt navn1");
      expect(endring1?.opprinneligKrets.nummer).toBe("11");
      expect(endring1?.navn).toBe("nytt navn3");
      expect(endring1?.nummer).toBe("14");
    });

    it("kresdeling skal liste opp alle kretsen som er delt", async () => {
      const entries = [
        createKretsdelingEntry(mockStemmekrets1.id.lokalid.value, [
          { navn: "ny1", nummer: "1" },
          { navn: "ny2", nummer: "2" },
        ]),
      ];

      const { result } = renderHookWithHistory(entries);
      await waitFor(() => expect(result.current.laster).toBeFalsy);

      expect(result.current.harEndringer).toBeTruthy;
      expect(result.current.kretsendringer.delinger?.length).toBe(1);

      const kretsdeling = result.current.kretsendringer.delinger![0];

      expect(kretsdeling.opprinneligKrets.kretsNavn).toBe(mockStemmekrets1.navn);
      expect(kretsdeling.opprinneligKrets.kretsNummer).toBe(mockStemmekrets1.nummer);

      expect(kretsdeling.nyeKretser.length).toBe(3);
      expect(kretsdeling.nyeKretser[0].kretsNavn).toBe("ny1");
      expect(kretsdeling.nyeKretser[0].kretsNummer).toBe("1");
      expect(kretsdeling.nyeKretser[1].kretsNavn).toBe("ny2");
      expect(kretsdeling.nyeKretser[1].kretsNummer).toBe("2");
      expect(kretsdeling.nyeKretser[2].kretsNavn).toBe(mockStemmekrets1.navn);
      expect(kretsdeling.nyeKretser[2].kretsNummer).toBe(mockStemmekrets1.nummer);
    });

    it("ved kretsdeling av samme krets flere ganger skal kun den siste være gjeldende", async () => {
      const entries = [
        createKretsdelingEntry(mockStemmekrets1.id.lokalid.value, [
          { navn: "ny1", nummer: "1" },
          { navn: "ny2", nummer: "2" },
        ]),
        createKretsdelingEntry(mockStemmekrets1.id.lokalid.value, [
          { navn: "ny3", nummer: "3" },
          { navn: "ny4", nummer: "4" },
        ]),
      ];

      const { result } = renderHookWithHistory(entries);
      await waitFor(() => expect(result.current.laster).toBeFalsy);

      expect(result.current.harEndringer).toBeTruthy;
      expect(result.current.kretsendringer.delinger?.length).toBe(1);

      const kretsdeling = result.current.kretsendringer.delinger![0];

      expect(kretsdeling.opprinneligKrets.kretsNavn).toBe(mockStemmekrets1.navn);
      expect(kretsdeling.opprinneligKrets.kretsNummer).toBe(mockStemmekrets1.nummer);

      expect(kretsdeling.nyeKretser.length).toBe(3);
      expect(kretsdeling.nyeKretser[0].kretsNavn).toBe("ny3");
      expect(kretsdeling.nyeKretser[0].kretsNummer).toBe("3");
      expect(kretsdeling.nyeKretser[1].kretsNavn).toBe("ny4");
      expect(kretsdeling.nyeKretser[1].kretsNummer).toBe("4");
      expect(kretsdeling.nyeKretser[2].kretsNavn).toBe(mockStemmekrets1.navn);
      expect(kretsdeling.nyeKretser[2].kretsNummer).toBe(mockStemmekrets1.nummer);
    });
  });

  describe("kommuneendringer", () => {
    it("skal returnere hvor mange kommuner som har endret samisk forvaltningsområde", () => {});

    it("skal returnere hvor mange kommuner som har endret navn", () => {});

    it("om samme kommune endrer navn og samisk forvaltningsområde skal det telles som 2 endringer", () => {});

    it("om samme kommune endrer navn og samisk forvaltningsområde skal det telles som 2 endringer", () => {});

    it("om man endrer navn 2 ganger på samme kommune skal det telles som 1 endring", () => {});

    it("om man endrer samisk forvalntningområde frem og tilabke i 2 endringer skal det ikke telles som en endring", () => {});
  });
});

function renderHookWithHistory(entries: HistoryEntry[]) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <MockAuthProvider>
      <HistoryProvider initialHistory={entries}>{children}</HistoryProvider>
    </MockAuthProvider>
  );
  return renderHook(() => useUnsavedEndringer(), { wrapper });
}

function createNyGrenseHistoryEntry(id: string): NyGrenseEntry {
  const featureProperties = getDefaultFeatureProperties("Stemmekretsgrense") as FeatureProperties;
  return {
    type: "nygrense",
    changes: [
      {
        id,
        from: { ...featureProperties, srid: 1234, coordinates: [], type: "STEMMEKRETS" },
        to: {
          ...featureProperties,
          srid: 1234,
          coordinates: [
            [1, 1],
            [2, 2],
          ],
          type: "STEMMEKRETS",
        },
      },
    ],
  };
}

function createKommuneMetadataEntry(
  navn: { from: string; to: string },
  samiskforvaltning: { from: boolean; to: boolean },
): KommuneEntry {
  return {
    type: "kommune",
    fylkeId: "11",
    changes: [
      {
        id: "123",
        from: {
          administrativenhetnavn: [{ rekkefoelge: undefined, navn: navn.from, version: 1, spraak: "NO" }],
          lokalid: "123",
          samiskforvaltningsomraade: samiskforvaltning.from,
          version: 1,
        },
        to: {
          administrativenhetnavn: [{ rekkefoelge: undefined, navn: navn.to, version: 1, spraak: "NO" }],
          lokalid: "123",
          samiskforvaltningsomraade: samiskforvaltning.to,
          version: 1,
        },
      },
    ],
  };
}

function createGrensedelingHistoryEntry(id: string, nyeIDer: string[]): GrenseDelingEntry {
  return {
    type: "grensedeling",
    changes: [
      {
        id,
        from: [new Feature({ id })],
        to: nyeIDer.map((newId) => new Feature({ id: newId })),
      },
    ],
  };
}

function createArchivedGrenseHistoryEntry(id: string): GrenseArkiveringsEntry {
  const featureProperties = getDefaultFeatureProperties("Stemmekretsgrense") as FeatureProperties;
  return {
    type: "grensearkivering",
    changes: [
      {
        id,
        from: { ...featureProperties },
        to: {
          ...featureProperties,
          shouldArchive: true,
        },
      },
    ],
  };
}

function createEditedGrenseHistoryEntry(id: string): GrenseEntry {
  const featureProperties = getDefaultFeatureProperties("Stemmekretsgrense") as FeatureProperties;
  return {
    type: "grense",
    changes: [
      {
        id,
        from: {
          ...featureProperties,
          coordinates: [
            [5, 5],
            [7, 7],
          ],
          type: "STEMMEKRETS",
        },
        to: {
          ...featureProperties,
          coordinates: [
            [1, 1],
            [2, 2],
          ],
          type: "STEMMEKRETS",
        },
      },
    ],
  };
}

function createEditedGrensePropertiesHistoryEntry(id: string): PropertyEntry {
  const featureProperties = getDefaultFeatureProperties("Stemmekretsgrense") as FeatureProperties;
  return {
    type: "property",
    changes: [
      {
        id,
        from: {
          ...featureProperties,
          type: "STEMMEKRETS",
        },
        to: {
          ...featureProperties,
          type: "STEMMEKRETS",
        },
      },
    ],
  };
}

function createEditedGrenseTilhorigheterHistoryEntry(id: string): GrenseTilhorighetEntry {
  return {
    type: "grensetilhorighetendring",
    changes: [
      {
        id,
        from: [],
        to: [],
      },
    ],
  };
}

type NavnOgNummer = {
  navn: string;
  nummer: string;
};
function createMetadataendringHistoryEntry(id: string, from: NavnOgNummer, to: NavnOgNummer): StemmekretsEntry {
  return {
    type: "stemmekrets",
    kommuneId: "123",
    changes: [
      {
        id,
        from: {
          navn: from.navn,
          nummer: from.nummer,
          identifikasjon: {
            lokalid: id,
          },
          version: 1,
        },
        to: {
          navn: to.navn,
          nummer: to.nummer,
          identifikasjon: {
            lokalid: id,
          },
          version: 2,
        },
      },
    ],
  };
}

function createKretsdelingEntry(id: string, to: NavnOgNummer[]): KretsdelingEntry {
  const kretsdelingrequest: KretsDelingEndringRequest = {
    opprinneligKrets: {
      lokalId: id,
      version: 1,
    },
    kommuneId: { lokalid: { value: "123" }, gyldighetsdato: "" },
    flatetype: "STEMMEKRETS",
    nyeKretser: to.map((nyKrets) => ({ kretsNavn: nyKrets.navn, kretsNummer: nyKrets.nummer })),
  };

  return {
    type: "kretsdelingendring",
    changes: [
      {
        id: id,
        from: kretsdelingrequest,
        to: kretsdelingrequest,
      },
    ],
  };
}

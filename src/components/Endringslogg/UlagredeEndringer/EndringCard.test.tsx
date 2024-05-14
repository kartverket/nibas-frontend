import { describe, expect, it } from "vitest";
import { EndringerCard } from "components/Endringslogg/UlagredeEndringer/EndringerCard";
import { AbstractedHistoryEntry } from "components/Endringslogg/hooks/useUnsavedEndringer";
import { KretsDelingEndringRequest } from "../../../types/api";
import {
  mockDetailedGrunnkrets1,
  mockDetailedGrunnkrets2,
  mockStemmekrets1,
  mockStemmekrets2,
} from "../../../mocks/handlers/responses";
import { render } from "test/test-utils";
import { waitFor } from "@testing-library/react";

const mockGrunnkrets1 = mockDetailedGrunnkrets1;
const mockGrunnkrets2 = mockDetailedGrunnkrets2;

describe("Unlagrede endringer EndringerCard", () => {
  describe("kretsdelinger", () => {
    it("skal liste opp alle grunnkretsdelinger", async () => {
      const kretsdeling1 = createKretsdeling(
        mockGrunnkrets1.id.lokalid.value,
        [
          { kretsNavn: "nykrets1", kretsNummer: "11" },
          { kretsNavn: "nykrets2", kretsNummer: "22" },
        ],
        "GRUNNKRETS",
      );

      const kretsdeling2 = createKretsdeling(
        mockGrunnkrets2.id.lokalid.value,
        [
          { kretsNavn: "en ny krets", kretsNummer: "21" },
          { kretsNavn: "enda en ny", kretsNummer: "31" },
        ],
        "GRUNNKRETS",
      );

      const endringer: AbstractedHistoryEntry[] = [
        {
          type: "kretsdelingendring",
          lokalid: "dummy",
          from: kretsdeling1,
          to: kretsdeling1,
        },
        {
          type: "kretsdelingendring",
          lokalid: "dummy",
          from: kretsdeling2,
          to: kretsdeling2,
        },
      ];

      const { getAllByTestId } = render(<EndringerCard type="kretsdelingendring" endringer={endringer} />);

      // We need to wait for the component to fetch the name (from mock)
      await waitFor(() => expect(getAllByTestId("changerow")[0].textContent).toContain(mockGrunnkrets1.navn));

      const changerows = getAllByTestId("changerow");
      expect(changerows.length).toBe(2);

      const [old1, new1] = changerows[0].textContent!.split("arrow_right_alt");
      expect(old1).toContain(mockGrunnkrets1.nummer);
      expect(old1).toContain(mockGrunnkrets1.navn);

      expect(new1).toContain("11 nykrets1");
      expect(new1).toContain("22 nykrets2");
      expect(new1).toContain(mockGrunnkrets1.nummer);
      expect(new1).toContain(mockGrunnkrets1.navn);

      const [old2, new2] = changerows[1].textContent!.split("arrow_right_alt");
      expect(old2).toContain(mockGrunnkrets2.nummer);
      expect(old2).toContain(mockGrunnkrets2.navn);

      expect(new2).toContain("21 en ny krets");
      expect(new2).toContain("31 enda en ny");
      expect(new2).toContain(mockGrunnkrets2.nummer);
      expect(new2).toContain(mockGrunnkrets2.navn);
    });

    it("skal liste opp alle stemmekretsdelinger", async () => {
      const kretsdeling1 = createKretsdeling(
        mockStemmekrets1.id.lokalid.value,
        [
          { kretsNavn: "nykrets1", kretsNummer: "11" },
          { kretsNavn: "nykrets2", kretsNummer: "22" },
        ],
        "STEMMEKRETS",
      );

      const kretsdeling2 = createKretsdeling(
        mockStemmekrets2.id.lokalid.value,
        [
          { kretsNavn: "en ny krets", kretsNummer: "21" },
          { kretsNavn: "enda en ny", kretsNummer: "31" },
        ],
        "STEMMEKRETS",
      );

      const endringer: AbstractedHistoryEntry[] = [
        {
          type: "kretsdelingendring",
          lokalid: "dummy",
          from: kretsdeling1,
          to: kretsdeling1,
        },
        {
          type: "kretsdelingendring",
          lokalid: "dummy",
          from: kretsdeling2,
          to: kretsdeling2,
        },
      ];

      const { getAllByTestId } = render(<EndringerCard type="kretsdelingendring" endringer={endringer} />);

      // We need to wait for the component to fetch the name (from mock)
      await waitFor(() => expect(getAllByTestId("changerow")[0].textContent).toContain(mockStemmekrets1.navn));

      const changerows = getAllByTestId("changerow");
      expect(changerows.length).toBe(2);

      const [old1, new1] = changerows[0].textContent!.split("arrow_right_alt");
      expect(old1).toContain(mockStemmekrets1.nummer);
      expect(old1).toContain(mockStemmekrets1.navn);

      expect(new1).toContain("11 nykrets1");
      expect(new1).toContain("22 nykrets2");
      expect(new1).toContain(mockStemmekrets1.nummer);
      expect(new1).toContain(mockStemmekrets1.navn);

      const [old2, new2] = changerows[1].textContent!.split("arrow_right_alt");
      expect(old2).toContain(mockStemmekrets2.nummer);
      expect(old2).toContain(mockStemmekrets2.navn);

      expect(new2).toContain("21 en ny krets");
      expect(new2).toContain("31 enda en ny");
      expect(new2).toContain(mockStemmekrets2.nummer);
      expect(new2).toContain(mockStemmekrets2.navn);
    });
  });
});

const createKretsdeling = (
  opprinneligKrets: string,
  nyeKretser: { kretsNavn: string; kretsNummer: string }[],
  flatetype: "GRUNNKRETS" | "STEMMEKRETS",
): KretsDelingEndringRequest => {
  return {
    opprinneligKrets: {
      lokalId: opprinneligKrets,
      version: 1,
    },
    kommuneId: {
      lokalid: { value: "lokalid" },
      gyldighetsdato: "123",
    },
    flatetype: flatetype,
    nyeKretser: nyeKretser,
  };
};

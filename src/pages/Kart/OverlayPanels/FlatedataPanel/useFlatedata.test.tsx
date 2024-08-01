import { describe } from "vitest";
import { MetadataResponse } from "../../../../types/api";
import { HistoryEntry, StemmekretsEntry } from "contexts/HistoryContext/types";
import { PropsWithChildren } from "react";
import { act, renderHook, RenderHookResult } from "@testing-library/react";
import { useFlatedata } from "pages/Kart/OverlayPanels/FlatedataPanel/useFlatedata";
import { MockAuthProvider } from "../../../../mocks/contexts/AuthContextMock";
import { HistoryProvider } from "contexts/HistoryContext/HistoryContext";
import { UtkastProvider } from "contexts/UtkastContext/UtkastContext";
import { MemoryRouter } from "react-router-dom";
import {
  mockKommune,
  mockStemmekrets1,
  mockStemmekrets2,
  mockStemmekretser,
  mockUtkast,
  mockUtkastIngenEndringer,
} from "../../../../mocks/handlers/responses";
import { FeatureStyleProvider } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { ErrorHandlingProvider } from "contexts/ErrorHandlingContext";

describe("useFlatedata", () => {
  it("skal returnere informasjon om inndelingen fra backend", async () => {
    const { result } = await act(() => renderHookWithHistoryAndUtkast(false, []));
    const flatedata = result.current;

    expect(flatedata?.length).toBe(mockStemmekretser.length);
    expect(flatedata?.[0].id.lokalid.value).toBe(mockStemmekrets1.id.lokalid.value);
    expect(flatedata?.[1].id.lokalid.value).toBe(mockStemmekrets2.id.lokalid.value);
    expect(flatedata?.[0].navn).toBe(mockStemmekrets1.navn);
    expect(flatedata?.[1].navn).toBe(mockStemmekrets2.navn);
  });

  it("skal returnere informasjon om inndelingen inkludert endringer fra utkastet", async () => {
    const { result } = await act(() => renderHookWithHistoryAndUtkast(true, []));
    const flatedata = result.current;

    expect(flatedata?.[0].id.lokalid.value).toBe(mockStemmekrets1.id.lokalid.value);
    expect(flatedata?.[0].navn).toBe("Utkast stemmekrets");
    expect(flatedata?.[0].nummer).toBe("123");
  });

  it("skal returnere informasjon om inndelingen inkludert endringer fra history", async () => {
    const metadataentry = createMetadataendringHistoryEntry(
      mockStemmekrets1.id.lokalid.value,
      { navn: mockStemmekrets1.navn, nummer: mockStemmekrets1.nummer },
      { navn: "nytt navn", nummer: "321" },
    );

    const { result } = await act(() => renderHookWithHistoryAndUtkast(false, [metadataentry]));
    const flatedata = result.current;

    expect(flatedata?.[0].id.lokalid.value).toBe(mockStemmekrets1.id.lokalid.value);
    expect(flatedata?.[0].navn).toBe("nytt navn");
    expect(flatedata?.[0].nummer).toBe("321");
  });

  it("skal returnere informasjon om inndelingen fra history om det er både endringer fra history og utkastet", async () => {
    const metadataentry = createMetadataendringHistoryEntry(
      mockStemmekrets1.id.lokalid.value,
      { navn: mockStemmekrets1.navn, nummer: mockStemmekrets1.nummer },
      { navn: "nytt navn", nummer: "321" },
    );

    const { result } = await act(() => renderHookWithHistoryAndUtkast(true, [metadataentry]));
    const flatedata = result.current;

    expect(flatedata?.[0].id.lokalid.value).toBe(mockStemmekrets1.id.lokalid.value);
    expect(flatedata?.[0].navn).toBe("nytt navn");
    expect(flatedata?.[0].nummer).toBe("321");
  });

  it("skal returnere informasjon om inndelingen skal håndtere flere endringer på samme inndeling i history", async () => {
    const metadataentry1 = createMetadataendringHistoryEntry(
      mockStemmekrets1.id.lokalid.value,
      { navn: mockStemmekrets1.navn, nummer: mockStemmekrets1.nummer },
      { navn: "nytt navn", nummer: "321" },
    );

    const metadataentry2 = createMetadataendringHistoryEntry(
      mockStemmekrets1.id.lokalid.value,
      { navn: "nytt navn", nummer: "321" },
      { navn: "nytt navn2", nummer: "3212" },
    );

    const { result } = await act(() => renderHookWithHistoryAndUtkast(true, [metadataentry1, metadataentry2]));
    const flatedata = result.current;

    expect(flatedata?.[0].id.lokalid.value).toBe(mockStemmekrets1.id.lokalid.value);
    expect(flatedata?.[0].navn).toBe("nytt navn2");
    expect(flatedata?.[0].nummer).toBe("3212");
  });
});

function renderHookWithHistoryAndUtkast(medUtkastEndringer: boolean, entries: HistoryEntry[]) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <MockAuthProvider>
      <FeatureStyleProvider>
        <HistoryProvider initialHistory={entries}>
          <MemoryRouter
            initialEntries={[`/utkast/${medUtkastEndringer ? mockUtkast.id : mockUtkastIngenEndringer.id}`]}
          >
            <ErrorHandlingProvider>
              <UtkastProvider>{children}</UtkastProvider>
            </ErrorHandlingProvider>
          </MemoryRouter>
        </HistoryProvider>
      </FeatureStyleProvider>
    </MockAuthProvider>
  );

  // Siden denne hooken gjør en del ting på første kall, så må vi wrappe den i et promise så we kan awaite at den
  // har oppdatert alle verdiene sine før vi kjører videre i testene. Siden all data den henter kommer fra mocks
  // så holder det med en setTimeout uten noe tid, bare for å legge det sist i event-loopen (etter mocks har returnert
  // data og verdiene i hooken er oppdatert).
  return new Promise<RenderHookResult<MetadataResponse[] | undefined, unknown>>((resolve) => {
    const hookValues = renderHook(
      () =>
        useFlatedata({
          id: mockKommune.id.lokalid.value,
          nummer: mockKommune.nummer,
          navn: mockKommune.navn,
          inndelingtype: "stemmekrets",
          isEditing: true,
          isViewing: true,
        }),
      { wrapper },
    );
    setTimeout(() => {
      resolve(hookValues);
    });
  });
}

type NavnOgNummer = {
  navn: string;
  nummer: string;
};

function createMetadataendringHistoryEntry(id: string, from: NavnOgNummer, to: NavnOgNummer): StemmekretsEntry {
  return {
    type: "stemmekrets",
    kommuneId: mockKommune.id.lokalid.value,
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

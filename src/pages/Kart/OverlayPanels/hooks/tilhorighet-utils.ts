import { getKretsDelingEntries, getNyInndelingEntriesForInndelingtype } from "contexts/HistoryContext/history-utils";
import { HistoryEntry, NyInndelingEntry } from "contexts/HistoryContext/types";
import {
  getMetadataEndringerKeyForInndelingtype,
  historyToKretsdelingOperations,
} from "contexts/UtkastContext/utkast-utils";
import { KommunalInndelingResponse, KommunalInndelingtype } from "hooks/inndelinger/useKommuneInndelinger";
import { GrenseType } from "hooks/layers/types";
import {
  FeatureProperties,
  KontekstEgenskaper,
  KretsDelingEndringRequest,
  ObjektIdentifikator,
  UtkastOperasjoner,
} from "types/api";
import { removeNil } from "utils/list-utils";
import { isGrenseType } from "utils/type-utils";
import { getNonExhaustiveInndelingTypeFromRequest } from "../FlatedataPanel/flatedata-utils";

export enum Tilhorighet {
  A = "a",
  B = "b",
}

export const TILHORIGHET_INNDELINGTYPE_VALUES = ["GRUNNKRETS", "STEMMEKRETS", "BOPLIKTOMRAADE"] as const;
export type TilhorighetInndelingtype = (typeof TILHORIGHET_INNDELINGTYPE_VALUES)[number];

// TODO: Vurder rename til "Område" for å passe med både heldekkende og ikke-heldekkende inndelinger. (EXHAUSTIVE/NON-EXHAUSTIVE)
export type Krets = {
  id: ObjektIdentifikator;
  kommuneId: ObjektIdentifikator;
  kommunenummer: string;
  version: number;
  nummer: string;
  navn: string;
  type: TilhorighetInndelingtype;
};

export type TilhorighetOptions = {
  [Tilhorighet.A]: Krets[];
  [Tilhorighet.B]: Krets[];
};

export enum CustomOption {
  NOT_CHOSEN = "NOT_CHOSEN",
}

export type TilhorighetChoice = {
  [Tilhorighet.A]: string | undefined;
  [Tilhorighet.B]: string | undefined;
};

export type TilhorighetForm = Record<TilhorighetInndelingtype, TilhorighetChoice>;
export interface UseTilhorighet {
  inndelingType: TilhorighetInndelingtype;
  tilhorighetOptions: TilhorighetOptions | undefined;
  isDirty: boolean;
  resetTilhorighet: () => void;
  formState: TilhorighetForm;
  setValue: (tilhorighet: Tilhorighet, value: string | undefined) => void;
  isLoading: boolean;
  getCurrentOppdaterteKontekstEgenskaper: () => KontekstEgenskaper[] | undefined;
}

const getDefaultTilhorighetData = () => ({
  GRUNNKRETS: { a: CustomOption.NOT_CHOSEN, b: CustomOption.NOT_CHOSEN },
  STEMMEKRETS: { a: CustomOption.NOT_CHOSEN, b: CustomOption.NOT_CHOSEN },
  BOPLIKTOMRAADE: { a: CustomOption.NOT_CHOSEN, b: CustomOption.NOT_CHOSEN },
});

// tar to kontekstEgenskaper og mapper de til TilhorighetForm
export const getTilhorighetData = (tilhorigheter: KontekstEgenskaper[] | undefined): TilhorighetForm => {
  if (tilhorigheter != null && tilhorigheter.length > 0) {
    const grunnkretser = tilhorigheter.filter((kontekstEgenskaper) => kontekstEgenskaper.type === "GRUNNKRETS");
    const stemmekretser = tilhorigheter.filter((kontekstEgenskaper) => kontekstEgenskaper.type === "STEMMEKRETS");
    const bopliktomraader = tilhorigheter.filter((kontekstEgenskaper) => kontekstEgenskaper.type === "BOPLIKTOMRAADE");
    if (grunnkretser.length > 0 || stemmekretser.length > 0 || bopliktomraader.length > 0) {
      return {
        ["GRUNNKRETS"]: {
          [Tilhorighet.A]: getKretsIdFromKontekstegenskaper(grunnkretser[0]),
          [Tilhorighet.B]: grunnkretser.length > 1 ? getKretsIdFromKontekstegenskaper(grunnkretser[1]) : "NOT_CHOSEN",
        },
        ["STEMMEKRETS"]: {
          [Tilhorighet.A]: getKretsIdFromKontekstegenskaper(stemmekretser[0]),
          [Tilhorighet.B]: stemmekretser.length > 1 ? getKretsIdFromKontekstegenskaper(stemmekretser[1]) : "NOT_CHOSEN",
        },
        ["BOPLIKTOMRAADE"]: {
          [Tilhorighet.A]: getKretsIdFromKontekstegenskaper(bopliktomraader[0]),
          [Tilhorighet.B]:
            bopliktomraader.length > 1 ? getKretsIdFromKontekstegenskaper(bopliktomraader[1]) : "NOT_CHOSEN",
        },
      };
    }
  }
  return getDefaultTilhorighetData();
};

export const getKretsIdFromKontekstegenskaper = (
  kontekstegenskaper: KontekstEgenskaper | undefined,
): string | undefined => {
  if (kontekstegenskaper == null) {
    return undefined;
  }

  if (kontekstegenskaper.id?.lokalid.value === CustomOption.NOT_CHOSEN) {
    return getIdForTilhorhetNyKrets(
      kontekstegenskaper.kretsNummer ?? undefined,
      kontekstegenskaper.kommuneId?.lokalid.value,
    );
  }
  return kontekstegenskaper.id?.lokalid.value;
};

// Gir en krets med lokalid lik Default option slik at default verdien kan sendes som data slik som vanlige kretser.
const getDefaultKrets = (inndelingType: TilhorighetInndelingtype): Krets => {
  const defaultIdentifikator: ObjektIdentifikator = {
    lokalid: {
      value: CustomOption.NOT_CHOSEN,
    },
    gyldighetsdato: "",
  };
  return {
    id: defaultIdentifikator,
    kommuneId: defaultIdentifikator,
    version: 0,
    kommunenummer: "",
    navn: "",
    nummer: "",
    type: inndelingType,
  };
};

// Tar lokalider og mapper de til kretsValgene hvis det finnes en krets i kretsValg med tilsvarende id
export const getUpdatedKontekstEgenskaper = (
  inndelingType: TilhorighetInndelingtype,
  newKretsIds: TilhorighetChoice,
  kretsOptions: TilhorighetOptions,
): KontekstEgenskaper[] => {
  const allPossibleOptions = kretsOptions.a.concat(kretsOptions.b);
  const kretser = Object.values(newKretsIds).map(
    (id) => allPossibleOptions.find((krets) => krets.id.lokalid.value === id) ?? getDefaultKrets(inndelingType),
  );
  const nyeKontekstEgenskaper = kretser.map((krets) => ({
    id: krets.id.lokalid.value.startsWith("NY_KRETS") ? undefined : krets.id, // fjerner tempid når vi setter kontekstEgenskapene på featuren
    kommuneId: krets.kommuneId,
    kretsNummer: krets.nummer,
    type: krets.type,
    version: krets.version,
  }));
  return nyeKontekstEgenskaper;
};

export const formatKretsNavn = (krets: Krets | null | undefined): string => {
  if (krets == null || krets.type == null) {
    return "Ikke valgt";
  }
  switch (krets.type) {
    case "GRUNNKRETS":
      return `${krets.nummer} ${krets.navn}`;
    case "STEMMEKRETS":
      return `(${krets.kommunenummer}) ${krets.nummer} ${krets.navn}`;
    case "BOPLIKTOMRAADE":
      return `${krets.nummer} ${krets.navn}`;
  }
};

export const getKommunerIdFromKontekstEgenskaper = (
  kontekstEgenskaper: KontekstEgenskaper[],
  inndelingType: TilhorighetInndelingtype,
): string[] | null => {
  const kommuner = kontekstEgenskaper
    .filter((kontekst) => kontekst.type === inndelingType)
    .filter((kontekst) => kontekst.kommuneId !== null)
    .map((kontekst) => kontekst.kommuneId!.lokalid.value);
  return kommuner.length > 0 ? kommuner : null;
};

const sortKretserOptionsByFormattedName = (kretser: Krets[] | undefined): Krets[] => {
  if (!kretser) {
    return [];
  }

  return kretser.sort((a, b) => formatKretsNavn(a).localeCompare(formatKretsNavn(b)));
};

export const getIdForTilhorhetNyKrets = (kretsnummer: string | undefined, kommuneId: string | undefined) =>
  `NY_KRETS_${kretsnummer}_${kommuneId}`;

export const mapKommunalInndelingResponseToKrets = (
  inndelinger: KommunalInndelingResponse[],
  inndelingtype: KommunalInndelingtype,
): Krets[] => {
  return sortKretserOptionsByFormattedName(
    inndelinger.map(({ id, version, nummer, navn, kommuneIdentifikator, kommunenummer }) => ({
      id,
      kommuneId: kommuneIdentifikator,
      kommunenummer: kommunenummer.kodeverdi,
      version,
      nummer,
      navn,
      type: inndelingtype,
    })),
  );
};

export const getKretsTypeForFeature = (
  kontekstgenskaper: KontekstEgenskaper[],
  featureProperties: FeatureProperties,
): TilhorighetInndelingtype => {
  return (
    kontekstgenskaper.map((k) => k.type as TilhorighetInndelingtype)[0] ??
    (isGrenseType(featureProperties.type) && mapGrenseTypeTilTilhorighetInndelingtype(featureProperties.type))
  );
};

const mapGrenseTypeTilTilhorighetInndelingtype = (grenseType: GrenseType): TilhorighetInndelingtype => {
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (grenseType) {
    case "Stemmekretsgrense":
      return "STEMMEKRETS";
    case "Bopliktgrense":
      return "BOPLIKTOMRAADE";
    default:
      return "GRUNNKRETS";
  }
};

export const getUpdatedMetadataForKretser = (
  kretser: Krets[],
  historyEntries: HistoryEntry[],
  utkastEntries: UtkastOperasjoner,
  inndelingType: TilhorighetInndelingtype,
): Krets[] => {
  const metadataFromHistory = historyEntries
    .flatMap((historyEntry) =>
      historyEntry.changes.map((change) => {
        if (change.to != null && "navn" in change.to && "nummer" in change.to) {
          return {
            id: change.id,
            name: change.to.navn,
            number: change.to.nummer,
          };
        }
        return null;
      }),
    )
    .filter((entry): entry is { id: string; name: string; number: string } => entry !== null);

  const metadataFromUtkast = Object.values(
    utkastEntries.metadataendringer[getMetadataEndringerKeyForInndelingtype(inndelingType)],
  ).map((endring) => ({
    id: endring.identifikasjon.lokalid,
    name: endring.navn,
    number: endring.nummer,
  }));

  const metadataChanges = metadataFromHistory.concat(metadataFromUtkast);

  return kretser.map((krets) => {
    const matchingChange = metadataChanges.find((entry) => entry.id === krets.id.lokalid.value);

    if (matchingChange !== undefined) {
      return { ...krets, navn: matchingChange.name, nummer: matchingChange.number };
    }

    return krets;
  });
};

export const getIdForKontekstEgenskaper = (
  kontekstEgenskaper: KontekstEgenskaper,
  currentOperasjoner: UtkastOperasjoner | undefined,
): KontekstEgenskaper => {
  // Hvis konteksten har en id betyr det at den ikke peker til en nyopprettet krets, og vi kan derfor bruke den IDen for å identifisere kretsen.
  if (kontekstEgenskaper.id) {
    return kontekstEgenskaper;
  } else {
    const newKretsWithEqualKommuneAndKretsNummerExists = currentOperasjoner?.kretsDelingEndringer
      .filter((deling) => deling.kommuneId.lokalid.value === kontekstEgenskaper.kommuneId?.lokalid.value)
      .find((deling) => deling.nyeKretser.find((krets) => krets.kretsNummer === kontekstEgenskaper.kretsNummer));
    if (!newKretsWithEqualKommuneAndKretsNummerExists) {
      return {
        ...kontekstEgenskaper,
        id: {
          lokalid: { value: CustomOption.NOT_CHOSEN },
          gyldighetsdato: "",
        },
      };
      // hvis det finnes en ny krets med nummer og kommuneid lik en ny krets i utkastet OG kontekstegenskaper har id lik undefined lager vi en unik referanse til denne kretsen
    } else {
      return {
        ...kontekstEgenskaper,
        id: {
          lokalid: {
            value: getIdForTilhorhetNyKrets(
              kontekstEgenskaper.kretsNummer ?? undefined,
              kontekstEgenskaper.kommuneId?.lokalid.value,
            ),
          },
          gyldighetsdato: "",
        },
      };
    }
  }
};

export const getKretserFromKretsDelingEndringer = (
  kommunerIdOgNummer: { id: string; nummer: string }[],
  kretsDelingEndringRequests: KretsDelingEndringRequest[],
): Krets[] => {
  return kretsDelingEndringRequests
    .filter((kretsDeling) => kommunerIdOgNummer.some(({ id }) => id === kretsDeling.kommuneId.lokalid.value))
    .flatMap((kretsDeling) =>
      kretsDeling.nyeKretser.map((nyKrets) => ({
        id: {
          lokalid: { value: getIdForTilhorhetNyKrets(nyKrets.kretsNummer, kretsDeling.kommuneId.lokalid.value) },
          gyldighetsdato: "",
        },
        kommuneId: kretsDeling.kommuneId,
        kommunenummer:
          kommunerIdOgNummer.find((idOgNummer) => idOgNummer.id === kretsDeling.kommuneId.lokalid.value)?.nummer ?? "",
        version: kretsDeling.opprinneligKrets.version,
        type: kretsDeling.flatetype as TilhorighetInndelingtype, // TODO: Backend burde redusere enum for flatetyper som er gyldig for kretsdeling.
        navn: nyKrets.kretsNavn,
        nummer: nyKrets.kretsNummer,
      })),
    );
};

export const getKretserFromNyInndelingEntries = (
  entries: NyInndelingEntry[],
  kommunerIdOgNummer: { id: string; nummer: string }[],
): Krets[] => {
  const changes = entries.flatMap((entry) => entry.changes);
  const allInndelingRequests = removeNil(changes.flatMap((change) => change.to));

  return removeNil(
    allInndelingRequests.map((inndelingRequest) => {
      const kommune = kommunerIdOgNummer.find(
        (idOgNummer) => idOgNummer.nummer === inndelingRequest.kommunenummer?.kodeverdi,
      );
      const currentDate = new Date().toISOString();
      const type = getNonExhaustiveInndelingTypeFromRequest(inndelingRequest);
      if (type == null) {
        return null;
      }
      return {
        id: {
          lokalid: {
            value: getIdForTilhorhetNyKrets(inndelingRequest.nummer, kommune?.id ?? ""),
          },
          gyldighetsdato: currentDate,
        },
        kommuneId: {
          lokalid: {
            value: kommune?.id ?? "",
          },
          gyldighetsdato: currentDate,
        },
        kommunenummer: kommune?.nummer ?? "",
        version: inndelingRequest.version,
        nummer: inndelingRequest.nummer,
        navn: inndelingRequest.navn,
        type: type,
      };
    }),
  );
};

export const getKretserFromHistory = (
  entries: HistoryEntry[],
  kommunerIdOgNummer: { id: string; nummer: string }[],
  inndelingType: TilhorighetInndelingtype,
): Krets[] => {
  const kretsdelingerEntries = getKretsDelingEntries(entries);

  const nyeInndelingerEntries = getNyInndelingEntriesForInndelingtype(entries, inndelingType);

  const kretsdelingOperations = historyToKretsdelingOperations(kretsdelingerEntries).filter(
    (kretsdeling) => kretsdeling.flatetype === inndelingType,
  );

  const kretserForDelinger = getKretserFromKretsDelingEndringer(kommunerIdOgNummer, kretsdelingOperations);
  const kretserForNyeInndelinger = getKretserFromNyInndelingEntries(nyeInndelingerEntries, kommunerIdOgNummer);
  return [...kretserForDelinger, ...kretserForNyeInndelinger];
};

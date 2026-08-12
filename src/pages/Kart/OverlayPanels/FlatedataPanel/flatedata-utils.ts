import { HistoryChange } from "contexts/HistoryContext/types";
import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import {
  BopliktomraadeRequest,
  GjeldendeMaterielleVilkaar,
  GrunnkretsRequest,
  Inndelingtype,
  KommuneRequest,
  MetadataRequest,
  MetadataResponse,
  StemmekretsRequest,
} from "types/api";
import { getIdFromEntity } from "utils/api";
import { NonExhaustiveInndelingRequest } from "./FlatedataTable";
import { isBopliktomraadeInndeling, isKommuneInndeling, isStemmekretsInndeling } from "./useFlatedata";

type KommuneInput = { samiskforvaltningsomraade: boolean };
type KommuneInputs = { [inndelingId: string]: KommuneInput };

type StemmekretsInput = {
  navn: string;
  nummer: string;
  tellekretsnavn: string;
  tellekretsnummer: string;
  valgdistriktsnummer: string;
  informasjon: string;
};
type StemmekretsInputs = { [inndelingId: string]: StemmekretsInput };

type GrunnkretsInput = { navn: string; nummer: string; informasjon: string };
type GrunnkretsInputs = { [inndelingId: string]: GrunnkretsInput };

export type GjeldendeMaterielleVilkaarValue = GjeldendeMaterielleVilkaar[number];

type BopliktomraadeInput = {
  navn: string;
  nummer: string;
  gjelderKunDelAvKommunen: boolean;
  harUsikkerAvgrensning: boolean;
  forskriftsreferanse: string;
  gjeldendeMaterielleVilkaar: GjeldendeMaterielleVilkaar;
  andreLokaleAvgrensninger: string;
};

type BopliktomraadeInputs = { [inndelingId: string]: BopliktomraadeInput };

export type FlatedataInputs = KommuneInputs | StemmekretsInputs | GrunnkretsInputs | BopliktomraadeInputs;

// Litt uheldig distinksjon da vi ikke har noen diskriminator for å skille mellom de ulike input-typene.
const isGrunnkretsInput = (
  value: KommuneInput | StemmekretsInput | GrunnkretsInput | BopliktomraadeInput,
): value is GrunnkretsInput =>
  "informasjon" in value && !isBopliktomraadeInput(value) && !isStemmekretsInput(value) && !isKommuneInput(value);

const isKommuneInput = (
  value: KommuneInput | StemmekretsInput | GrunnkretsInput | BopliktomraadeInput,
): value is KommuneInput => "samiskforvaltningsomraade" in value;

const isStemmekretsInput = (
  value: KommuneInput | StemmekretsInput | GrunnkretsInput | BopliktomraadeInput,
): value is StemmekretsInput => "tellekretsnummer" in value && "tellekretsnavn" in value;

const isBopliktomraadeInput = (
  value: KommuneInput | StemmekretsInput | GrunnkretsInput | BopliktomraadeInput,
): value is BopliktomraadeInput =>
  "gjelderKunDelAvKommunen" in value &&
  "forskriftsreferanse" in value &&
  "gjeldendeMaterielleVilkaar" in value &&
  "andreLokaleAvgrensninger" in value &&
  "harUsikkerAvgrensning" in value;

export const getRequestFromInputs = (
  inndelingtype: Inndelingtype,
  data: KommuneInput | StemmekretsInput | GrunnkretsInput | BopliktomraadeInput,
  inndeling: MetadataResponse,
): MetadataRequest | null => {
  switch (inndelingtype) {
    case "FYLKE":
    case "KOMMUNE": {
      if (isKommuneInndeling(inndeling) && isKommuneInput(data)) {
        const kommuneRequest: KommuneRequest = {
          lokalid: getIdFromEntity(inndeling),
          administrativenhetnavn: inndeling.navn,
          version: inndeling.version,
          samiskforvaltningsomraade: data.samiskforvaltningsomraade,
        };
        return kommuneRequest;
      }
      return null;
    }
    case "STEMMEKRETS": {
      if (isStemmekretsInput(data) && isStemmekretsInndeling(inndeling)) {
        const stemmekretsRequest: StemmekretsRequest = {
          identifikasjon: {
            lokalid: getIdFromEntity(inndeling),
          },
          tellekretsnummer: data.tellekretsnummer !== "" ? data.tellekretsnummer : undefined,
          tellekretsnavn: data.tellekretsnavn !== "" ? data.tellekretsnavn : undefined,
          valgdistriktsnummer: inndeling.valgdistriktsnummer,
          version: inndeling.version,
          navn: data.navn,
          nummer: data.nummer,
          kommunenummer: inndeling.kommunenummer,
          informasjon: data.informasjon !== "" ? data.informasjon : undefined,
        };
        return stemmekretsRequest;
      }
      return null;
    }
    case "GRUNNKRETS": {
      if (isGrunnkretsInput(data)) {
        const grunnkretsRequest: GrunnkretsRequest = {
          identifikasjon: {
            lokalid: getIdFromEntity(inndeling),
          },
          version: inndeling.version,
          navn: data.navn,
          nummer: data.nummer,
          informasjon: data.informasjon !== "" ? data.informasjon : undefined,
        };
        return grunnkretsRequest;
      }
      return null;
    }
    case "BOPLIKTOMRAADE": {
      if (isBopliktomraadeInput(data) && isBopliktomraadeInndeling(inndeling)) {
        const bopliktomraadeRequest: BopliktomraadeRequest = {
          identifikasjon: {
            lokalid: getIdFromEntity(inndeling),
          },
          kommunenummer: inndeling.kommunenummer,
          version: inndeling.version,
          navn: data.navn,
          nummer: data.nummer,
          forskriftsreferanse: data.forskriftsreferanse,
          gjeldendeMaterielleVilkaar: data.gjeldendeMaterielleVilkaar,
          andreLokaleAvgrensninger: data.andreLokaleAvgrensninger !== "" ? data.andreLokaleAvgrensninger : undefined,
          harUsikkerAvgrensning: data.harUsikkerAvgrensning,
          gjelderKunDelAvKommunen: data.gjelderKunDelAvKommunen,
        };
        return bopliktomraadeRequest;
      }
      return null;
    }
  }
};

// Basert på felter som er endret i flatedatapanelet lager vi en liste med endringer for utkastet
export const reduceFlatedataChanges = (
  formValues: FlatedataInputs,
  previousValues: FlatedataInputs | undefined,
  utkastFlatedata: MetadataResponse[],
  inndeling: Inndeling,
) =>
  Object.entries(formValues).reduce<HistoryChange<MetadataRequest>[]>((accumulator, [key, newValues]) => {
    const oldValues = previousValues?.[key];

    if (oldValues) {
      // Dersom inndelingen er uendret skal vi ikke lage en endring i history
      if (isKommuneInput(oldValues)) {
        if (newValues.samiskforvaltningsomraade === oldValues.samiskforvaltningsomraade) {
          return accumulator;
        }
      } else if (isStemmekretsInput(oldValues)) {
        if (
          newValues.nummer === oldValues.nummer &&
          newValues.navn === oldValues.navn &&
          newValues.tellekretsnummer === oldValues.tellekretsnummer &&
          newValues.tellekretsnavn === oldValues.tellekretsnavn &&
          newValues.informasjon === oldValues.informasjon
        ) {
          return accumulator;
        }
      } else if (isBopliktomraadeInput(oldValues) && isBopliktomraadeInput(newValues)) {
        const materielleVilkaarUnchanged =
          newValues.gjeldendeMaterielleVilkaar.length === oldValues.gjeldendeMaterielleVilkaar.length &&
          newValues.gjeldendeMaterielleVilkaar.every((v) => oldValues.gjeldendeMaterielleVilkaar.includes(v));
        if (
          newValues.nummer === oldValues.nummer &&
          newValues.navn === oldValues.navn &&
          newValues.gjelderKunDelAvKommunen === oldValues.gjelderKunDelAvKommunen &&
          newValues.harUsikkerAvgrensning === oldValues.harUsikkerAvgrensning &&
          newValues.forskriftsreferanse === oldValues.forskriftsreferanse &&
          materielleVilkaarUnchanged === true &&
          newValues.andreLokaleAvgrensninger === oldValues.andreLokaleAvgrensninger
        ) {
          return accumulator;
        }
      } else if (isGrunnkretsInput(oldValues)) {
        if (
          newValues.nummer === oldValues.nummer &&
          newValues.navn === oldValues.navn &&
          newValues.informasjon === oldValues.informasjon
        ) {
          return accumulator;
        }
      }

      const changedInndeling = utkastFlatedata.find((flate) => getIdFromEntity(flate) === key);
      if (changedInndeling != null) {
        const fromRequest = getRequestFromInputs(inndeling.inndelingtype, oldValues, changedInndeling);
        const toRequest = getRequestFromInputs(inndeling.inndelingtype, newValues, changedInndeling);
        if (fromRequest != null && toRequest != null) {
          return [
            ...accumulator,
            {
              id: key,
              from: fromRequest,
              to: toRequest,
            },
          ];
        }
      }
    }

    return accumulator;
  }, []);

export const isValidUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const isInndelingNonExhaustive = (inndelingtype: Inndelingtype): boolean => {
  switch (inndelingtype) {
    case "BOPLIKTOMRAADE":
      return true;
    case "STEMMEKRETS":
    case "GRUNNKRETS":
    case "FYLKE":
    case "KOMMUNE":
      return false;
  }
};

export const getDefaultFlatedataForInndelingtype = (inndelingtype: Inndelingtype): MetadataResponse => {
  const date = new Date().toISOString();
  switch (inndelingtype) {
    case "FYLKE": {
      throw new Error('Not implemented yet: "FYLKE" case');
    }
    case "KOMMUNE": {
      throw new Error('Not implemented yet: "KOMMUNE" case');
    }
    case "GRUNNKRETS": {
      throw new Error('Not implemented yet: "GRUNNKRETS" case');
    }
    case "STEMMEKRETS": {
      throw new Error('Not implemented yet: "STEMMEKRETS" case');
    }
    case "BOPLIKTOMRAADE": {
      return {
        id: {
          lokalid: {
            value: getTempFlateId(inndelingtype),
          },
          gyldighetsdato: date,
        },
        navn: "",
        nummer: "01",
        gyldighet: {
          gyldigFra: "",
          gyldigTil: null,
        },
        oppdateringsdato: date,
        datafangstdato: date,
        kommunenummer: {
          id: "",
          kodeverdi: "",
        },
        kommuneIdentifikator: {
          lokalid: {
            value: "",
          },
          gyldighetsdato: "",
        },
        endringstype: "Import",
        representasjonspunkt: {
          type: "Feature",
          id: null,
          properties: {
            type: "Posisjon",
            srid: 25833,
            metadata: null,
            kontekstEgenskaper: [],
            version: 1,
            shouldArchive: false,
          },
          geometry: {
            type: "Point",
            coordinates: [0, 0],
          },
        },
        version: 1,
        informasjon: "",
        delvisBoplikt: false,
        gjelderKunDelAvKommunen: false,
        usikkerAvgrensning: false,
        harUsikkerAvgrensning: false,
        forskriftsreferanse: "",
        materielleVilkaar: [],
        gjeldendeMaterielleVilkaar: [],
        andreAvgrensninger: null,
        andreLokaleAvgrensninger: null,
        url: "",
      };
    }
  }
};

const getTempFlateId = (inndelingtype: Inndelingtype): string => {
  return `temp-${inndelingtype}-${Math.floor(Math.random() * 1000000)}`;
};

export const isTempFlateId = (id: string): boolean => {
  return id.startsWith("temp-");
};

export const partitionDictBy = <T extends Record<string, unknown>>(
  dict: T,
  predicate: (key: string) => boolean,
): [T, T] => {
  const matching: Record<string, unknown> = {};
  const nonMatching: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(dict)) {
    if (predicate(key)) {
      matching[key] = value;
    } else {
      nonMatching[key] = value;
    }
  }

  return [matching as T, nonMatching as T];
};

export const isBopliktomraadeRequest = (request: MetadataRequest): request is BopliktomraadeRequest => {
  return "identifikasjon" in request && "gjelderKunDelAvKommunen" in request;
};

export const reduceFlatedataChangesForNewInndelinger = (
  formValues: FlatedataInputs,
  utkastFlatedata: MetadataResponse[],
  inndeling: Inndeling,
) =>
  Object.entries(formValues).reduce<HistoryChange<NonExhaustiveInndelingRequest | null>[]>(
    (accumulator, [key, newValues]) => {
      if (isBopliktomraadeInput(newValues) && isInndelingNonExhaustive(inndeling.inndelingtype)) {
        const changedInndeling = utkastFlatedata.find((flate) => getIdFromEntity(flate) === key);
        if (changedInndeling != null) {
          const toRequest = getRequestFromInputs(inndeling.inndelingtype, newValues, changedInndeling);
          if (toRequest != null && isBopliktomraadeRequest(toRequest)) {
            return [
              ...accumulator,
              {
                id: key,
                from: null,
                to: toRequest,
              },
            ];
          }
        }
      }

      return accumulator;
    },
    [],
  );

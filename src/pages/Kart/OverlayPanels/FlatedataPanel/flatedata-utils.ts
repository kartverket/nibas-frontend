import { HistoryChange } from "contexts/HistoryContext/types";
import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import {
  BopliktomraadeRequest,
  GrunnkretsRequest,
  Inndelingtype,
  KommuneRequest,
  MetadataRequest,
  MetadataResponse,
  StemmekretsRequest,
  MaterielleVilkaar,
} from "types/api";
import { getIdFromEntity } from "utils/api";
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

export type MaterielleVilkaarValue = MaterielleVilkaar[number];
type BopliktomraadeInput = {
  navn: string;
  nummer: string;
  delvisBoplikt: boolean;
  forskriftsreferanse: string;
  url: string;
  informasjon: string;
  materielleVilkaar: MaterielleVilkaar;
  andreAvgrensninger: string;
};

type BopliktomraadeInputs = { [inndelingId: string]: BopliktomraadeInput };

export type FlatedataInputs = KommuneInputs | StemmekretsInputs | GrunnkretsInputs | BopliktomraadeInputs;

const isKommuneInput = (value: KommuneInput | StemmekretsInput | GrunnkretsInput): value is KommuneInput =>
  "samiskforvaltningsomraade" in value;

const isStemmekretsInput = (value: KommuneInput | StemmekretsInput | GrunnkretsInput): value is StemmekretsInput =>
  "tellekretsnummer" in value && "tellekretsnavn" in value;

const isBopliktomraadeInput = (
  value: KommuneInput | StemmekretsInput | GrunnkretsInput | BopliktomraadeInput,
): value is BopliktomraadeInput =>
  "delvisBoplikt" in value &&
  "forskriftsreferanse" in value &&
  "url" in value &&
  "informasjon" in value &&
  "materielleVilkaar" in value &&
  "andreAvgrensninger" in value;

const getRequestFromInputs = (
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
      if (!isKommuneInput(data)) {
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
          delvisBoplikt: data.delvisBoplikt,
          forskriftsreferanse: data.forskriftsreferanse,
          url: data.url,
          informasjon: data.informasjon !== "" ? data.informasjon : undefined,
          materielleVilkaar: data.materielleVilkaar,
          andreAvgrensninger: data.andreAvgrensninger !== "" ? data.andreAvgrensninger : undefined,
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
          newValues.materielleVilkaar.length === oldValues.materielleVilkaar.length &&
          newValues.materielleVilkaar.every((v) => oldValues.materielleVilkaar.includes(v));
        if (
          newValues.nummer === oldValues.nummer &&
          newValues.navn === oldValues.navn &&
          newValues.delvisBoplikt === oldValues.delvisBoplikt &&
          newValues.forskriftsreferanse === oldValues.forskriftsreferanse &&
          newValues.url === oldValues.url &&
          newValues.informasjon === oldValues.informasjon &&
          materielleVilkaarUnchanged === true &&
          newValues.andreAvgrensninger === oldValues.andreAvgrensninger
        ) {
          return accumulator;
        }
      } else if (
        newValues.nummer === oldValues.nummer &&
        newValues.navn === oldValues.navn &&
        newValues.informasjon === oldValues.informasjon
      ) {
        return accumulator;
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

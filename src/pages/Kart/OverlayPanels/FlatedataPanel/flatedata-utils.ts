import { HistoryChange } from "contexts/HistoryContext/types";
import { Inndeling, Inndelingtype } from "contexts/InndelingerContext/InndelingerContext";
import { MetadataResponse, MetadataRequest, KommuneRequest, StemmekretsRequest, GrunnkretsRequest } from "types/api";
import { getIdFromEntity } from "utils/api";
import { isKommuneInndeling, isStemmekretsInndeling } from "./useFlatedata";

type KommuneInput = { samiskforvaltningsomraade: boolean };
type KommuneInputs = { [inndelingId: string]: KommuneInput };
type StemmekretsInput = {
  navn: string;
  nummer: string;
  tellekretsnavn: string;
  tellekretsnummer: string;
  informasjon: string;
};
type StemmekretsInputs = { [inndelingId: string]: StemmekretsInput };
type GrunnkretsInput = { navn: string; nummer: string; informasjon: string };
type GrunnkretsInputs = { [inndelingId: string]: GrunnkretsInput };
export type FlatedataInputs = KommuneInputs | StemmekretsInputs | GrunnkretsInputs;

const isKommuneInput = (value: KommuneInput | StemmekretsInput | GrunnkretsInput): value is KommuneInput =>
  "samiskforvaltningsomraade" in value;

const isStemmekretsInput = (value: KommuneInput | StemmekretsInput | GrunnkretsInput): value is StemmekretsInput =>
  "tellekretsnummer" in value && "tellekretsnavn" in value;

const getRequestFromInputs = (
  inndelingtype: Inndelingtype,
  data: KommuneInput | StemmekretsInput | GrunnkretsInput,
  inndeling: MetadataResponse,
): MetadataRequest | null => {
  switch (inndelingtype) {
    case "fylke":
    case "kommune": {
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
    case "stemmekrets": {
      if (isStemmekretsInput(data)) {
        const stemmekretsRequest: StemmekretsRequest = {
          identifikasjon: {
            lokalid: getIdFromEntity(inndeling),
          },
          tellekretsnummer:
            isStemmekretsInndeling(inndeling) && data.tellekretsnummer !== "" ? data.tellekretsnummer : undefined,
          tellekretsnavn:
            isStemmekretsInndeling(inndeling) && data.tellekretsnavn !== "" ? data.tellekretsnavn : undefined,
          valgdistriktsnummer: isStemmekretsInndeling(inndeling) ? inndeling.valgdistriktsnummer : undefined,
          version: inndeling.version,
          navn: data.navn,
          nummer: data.nummer,
          kommunenummer: isStemmekretsInndeling(inndeling) ? inndeling.kommunenummer : undefined,
          informasjon: data.informasjon !== "" ? data.informasjon : undefined,
        };
        return stemmekretsRequest;
      }
      return null;
    }
    case "grunnkrets": {
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
      } else if (
        newValues.nummer === oldValues.nummer &&
        newValues.navn === oldValues.navn &&
        newValues.informasjon === oldValues.informasjon
      ) {
        return accumulator;
      }

      const changedInndeling = utkastFlatedata.find((flate) => getIdFromEntity(flate) === key);
      if (changedInndeling) {
        const fromRequest = getRequestFromInputs(inndeling.inndelingtype, oldValues, changedInndeling);
        const toRequest = getRequestFromInputs(inndeling.inndelingtype, newValues, changedInndeling);

        if (fromRequest && toRequest) {
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

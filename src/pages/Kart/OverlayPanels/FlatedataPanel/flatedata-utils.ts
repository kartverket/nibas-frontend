import { HistoryChange } from "contexts/HistoryContext/types";
import { Inndeling, Inndelingtype } from "contexts/InndelingerContext/InndelingerContext";
import { MetadataResponse, MetadataRequest, KommuneRequest, StemmekretsRequest, GrunnkretsRequest } from "types/api";
import { getIdFromEntity } from "utils/api";
import { isKommuneInndeling, isStemmekretsInndeling } from "./useFlatedata";
import { updateRepresentasjonspunkt } from "utils/map/layerStyles";

type KommuneInput = { samiskforvaltningsomraade: boolean };
type KommuneInputs = { [inndelingId: string]: KommuneInput };
type StemmekretsInput = { navn: string; nummer: string };
type StemmekretsInputs = { [inndelingId: string]: StemmekretsInput };
type GrunnkretsInput = StemmekretsInput;
type GrunnkretsInputs = { [inndelingId: string]: GrunnkretsInput };
export type FlatedataInputs = KommuneInputs | StemmekretsInputs | GrunnkretsInputs;

const isKommuneInput = (value: KommuneInput | StemmekretsInput): value is KommuneInput =>
  "samiskforvaltningsomraade" in value;

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
      if (!isKommuneInput(data)) {
        const stemmekretsRequest: StemmekretsRequest = {
          identifikasjon: {
            lokalid: getIdFromEntity(inndeling),
          },
          valgdistriktsnummer: isStemmekretsInndeling(inndeling) ? inndeling.valgdistriktsnummer : undefined,
          version: inndeling.version,
          navn: data.navn,
          nummer: data.nummer,
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
        if (newValues.samiskforvaltningsomraade === oldValues.samiskforvaltningsomraade) return accumulator;
      } else {
        if (newValues.nummer === oldValues.nummer && newValues.navn === oldValues.navn) return accumulator;
      }

      const changedInndeling = utkastFlatedata.find((flate) => getIdFromEntity(flate) === key);
      if (changedInndeling) {
        const fromRequest = getRequestFromInputs(inndeling.inndelingtype, oldValues, changedInndeling);
        const toRequest = getRequestFromInputs(inndeling.inndelingtype, newValues, changedInndeling);

        if (fromRequest && toRequest) {
          updateRepresentasjonspunkt(key, newValues.nummer, newValues.navn);
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

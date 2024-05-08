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
type GrunnkretsInputs = StemmekretsInputs;
export type FlatedataInputs = KommuneInputs | StemmekretsInputs | GrunnkretsInputs;

const isKommuneInput = (value: KommuneInput | StemmekretsInput): value is KommuneInput =>
  "samiskforvaltningsomraade" in value;

const getRequestFromInputs = (
  inndelingtype: Inndelingtype,
  data: KommuneInput | StemmekretsInput,
  krets: MetadataResponse,
): MetadataRequest | null => {
  switch (inndelingtype) {
    case "fylke":
    case "kommune": {
      if (isKommuneInndeling(krets) && isKommuneInput(data)) {
        const kommuneRequest: KommuneRequest = {
          lokalid: getIdFromEntity(krets),
          administrativenhetnavn: krets.navn,
          version: krets.version,
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
            lokalid: getIdFromEntity(krets),
          },
          valgdistriktsnummer: isStemmekretsInndeling(krets) ? krets.valgdistriktsnummer : undefined,
          version: krets.version,
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
            lokalid: getIdFromEntity(krets),
          },
          version: krets.version,
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
      // Dersom kretsen er uendret skal vi ikke lage en endring i history
      if (isKommuneInput(oldValues)) {
        if (newValues.samiskforvaltningsomraade === oldValues.samiskforvaltningsomraade) return accumulator;
      } else {
        if (newValues.nummer === oldValues.nummer && newValues.navn === oldValues.navn) return accumulator;
      }

      const krets = utkastFlatedata.find((flate) => getIdFromEntity(flate) === key);
      if (krets) {
        const fromRequest = getRequestFromInputs(inndeling.inndelingtype, oldValues, krets);
        const toRequest = getRequestFromInputs(inndeling.inndelingtype, newValues, krets);

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

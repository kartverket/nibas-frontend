import { HistoryChange } from "contexts/HistoryContext/types";
import { Inndeling, Inndelingtype } from "contexts/InndelingerContext/InndelingerContext";
import { MetadataResponse, MetadataRequest, KommuneRequest, StemmekretsRequest, GrunnkretsRequest } from "types/api";
import { getIdFromEntity } from "utils/api";
import { updateEditFeatureText } from "utils/map/layerStyles";
import { getRepresentasjonspunktId } from "utils/map/source";
import { isKommuneInndeling, isStemmekretsInndeling } from "./useFlatedata";

type KommuneInput = { samiskforvaltningsomraade: boolean };
type KommuneInputs = { [inndelingId: string]: KommuneInput };
type StemmekretsInput = { navn: string; nummer: string };
type StemmekretsInputs = { [inndelingId: string]: StemmekretsInput };
type GrunnkretsInputs = StemmekretsInputs;
export type FlatedataInputs = KommuneInputs | StemmekretsInputs | GrunnkretsInputs;

export const isKommuneInput = (value: KommuneInput | StemmekretsInput): value is KommuneInput =>
  "samiskforvaltningsomraade" in value;

export const fromFormToRequest = (
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

export const reduceFlatedataChanges = (
  formValues: FlatedataInputs,
  previousValues: FlatedataInputs | undefined,
  utkastFlatedata: MetadataResponse[],
  inndeling: Inndeling,
) =>
  Object.entries(formValues).reduce<HistoryChange<MetadataRequest>[]>((accumulator, [key, newValues]) => {
    const oldValues = previousValues?.[key];

    if (oldValues) {
      // Dersom kretsen er uendret skal vi ikke gjøre noe med den
      if (isKommuneInput(oldValues)) {
        if (newValues.samiskforvaltningsomraade === oldValues.samiskforvaltningsomraade) return accumulator;
      } else {
        if (newValues.nummer === oldValues.nummer && newValues.navn === oldValues.navn) return accumulator;
      }

      const krets = utkastFlatedata.find((flate) => getIdFromEntity(flate) === key);
      if (krets) {
        const fromRequest = fromFormToRequest(inndeling.inndelingtype, oldValues, krets);
        const toRequest = fromFormToRequest(inndeling.inndelingtype, newValues, krets);

        updateEditFeatureText(getRepresentasjonspunktId(key), newValues.navn, newValues.nummer);

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

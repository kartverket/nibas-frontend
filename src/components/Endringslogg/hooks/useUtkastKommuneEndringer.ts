import { KommuneResponse, UtkastResponse } from "../../../types/api";
import { Kommuneendringer, KommuneendringerForFylke } from "components/Endringslogg/hooks/utkastEndringerTypes";
import useFylker from "hooks/inndelinger/useFylker";
import {
  getNavnendringForKommune,
  getSamiskforvaltningsomraadednring,
} from "components/Endringslogg/hooks/endringerUtils";
import { getUniqueItems } from "utils/list-utils";
import { inndelingResponseNavnToString } from "utils/language/language";
import useKommuner from "hooks/inndelinger/useKommuner";

type UseUtkastKommuneEndringerReturnType = {
  harEndringer: boolean;
  laster: boolean;
  endringer: KommuneendringerForFylke[] | null;
};

export const useUtkastKommuneEndringer = (
  utkast: UtkastResponse,
  shouldFetchEndringer: boolean = true,
): UseUtkastKommuneEndringerReturnType => {
  const { kommuner, isLoading: lasterKommuner } = useKommuner(null, utkast.gyldigFra, shouldFetchEndringer);
  const { isLoading: lasterFylker, fylker } = useFylker(utkast.gyldigFra, shouldFetchEndringer);

  const endringer = getEndringerForKommuner(utkast, kommuner);
  const fylkerMedEndringer = getUniqueItems(endringer.map((endring) => endring.nummer.slice(0, 2)));

  const endringerForFylke = fylkerMedEndringer.map((fylkesnummer) => {
    const fylke = fylker?.find((f) => f.nummer === fylkesnummer);
    return {
      nummer: fylkesnummer,
      navn: inndelingResponseNavnToString(fylke?.navn ?? []),
      kommuneendringer: endringer.filter((endring) => endring.nummer.startsWith(fylkesnummer)),
    };
  });

  return {
    laster: lasterFylker || lasterKommuner,
    harEndringer: endringer.length > 0,
    endringer: endringerForFylke,
  };
};

const getEndringerForKommuner = (
  utkast: UtkastResponse,
  alleKommuner: KommuneResponse[] | undefined,
): Kommuneendringer[] => {
  if (alleKommuner == null) {
    return [];
  }

  const kommunerMedEndringer = Object.keys(utkast.operasjoner.metadataendringer.kommuneendringer);

  return kommunerMedEndringer.map((kommuneId) => {
    const kommune = alleKommuner.find((k) => k.id.lokalid.value === kommuneId);
    return {
      nummer: kommune?.nummer ?? "",
      gammeltNavn: kommune?.navn != null ? inndelingResponseNavnToString(kommune.navn) : "",
      samiskforvaltningsomraade: getSamiskforvaltningsomraadednring(kommuneId, utkast.operasjoner, alleKommuner),
      navn: getNavnendringForKommune(kommuneId, utkast.operasjoner, alleKommuner),
    };
  });
};

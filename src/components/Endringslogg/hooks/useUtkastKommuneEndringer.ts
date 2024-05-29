import { KommuneResponse, UtkastResponse } from "../../../types/api";
import { Kommuneendringer, KommuneendringerForFylke } from "components/Endringslogg/hooks/utkastEndringerTypes";
import useFylker from "hooks/inndelinger/useFylker";
import {
  getNavnendringForKommune,
  getSamiskforvaltningsomraadednring,
} from "components/Endringslogg/hooks/endringerUtils";
import useNibasApi from "hooks/useNibasApi";
import { getUniqueItems } from "utils/list-utils";
import { inndelingResponseNavnToString } from "utils/language/language";

type UseUtkastKommuneEndringerReturnType = {
  harEndringer: boolean;
  laster: boolean;
  endringer: KommuneendringerForFylke[] | null;
};

export const useUtkastKommuneEndringer = (utkast: UtkastResponse): UseUtkastKommuneEndringerReturnType => {
  const { data: kommuner, isLoading: lasterKommuner } = useNibasApi("/v1/kommuner");
  const { isLoading: lasterFylker, fylker } = useFylker();

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

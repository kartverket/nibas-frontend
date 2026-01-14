import { UtkastResponse } from "types/api";
import {
  KommuneendringerForFylke,
  Kretsendringer,
  KretsendringerForKommune,
} from "components/Endringslogg/hooks/utkastEndringerTypes";
import {
  useUtkastGrunnkretsEndringer,
  useUtkastStemmekretsEndringer,
  useUtkastBopliktomraadeEndringer,
} from "components/Endringslogg/hooks/useUtkastKretsEndringer";
import { useUtkastKommuneEndringer } from "components/Endringslogg/hooks/useUtkastKommuneEndringer";
import { useUtkastUtenTilhorighetEndringer } from "components/Endringslogg/hooks/useUtkastUtenTilhorighetEndringer";

type UseUtkastEndringerReturnType = {
  laster: boolean;
  harEndringer: boolean;
  stemmekretsendringer: KretsendringerForKommune[] | null;
  grunnkretsendringer: KretsendringerForKommune[] | null;
  bopliktomraadeendringer: KretsendringerForKommune[] | null;
  endringerutentilhorighet: Kretsendringer | null;
  kommunendringer: KommuneendringerForFylke[] | null;
};

export const useUtkastEndringer = (
  utkast: UtkastResponse,
  shouldFetchEndringer: boolean = true,
): UseUtkastEndringerReturnType => {
  const {
    endringer: stemmekretsEndringer,
    harEndringer: harStemmekretsEndringer,
    laster: lasterStemmekretsEndringer,
  } = useUtkastStemmekretsEndringer(utkast, shouldFetchEndringer);

  const {
    endringer: grunnkretsEndringer,
    harEndringer: harGrunnkretsEndringer,
    laster: lasterGrunnkretsEndringer,
  } = useUtkastGrunnkretsEndringer(utkast, shouldFetchEndringer);

  const {
    endringer: bopliktomraadeEndringer,
    harEndringer: harBopliktomraadeEndringer,
    laster: lasterBopliktomraadeEndringer,
  } = useUtkastBopliktomraadeEndringer(utkast, shouldFetchEndringer);

  const {
    endringer: kommuneEndringer,
    harEndringer: harKommuneEndringer,
    laster: lasterKommuneEndringer,
  } = useUtkastKommuneEndringer(utkast, shouldFetchEndringer);

  const { endringer: endringerUtenTilhorighet, harEndringer: harEndringerUtenTilhorhget } =
    useUtkastUtenTilhorighetEndringer(utkast);

  return {
    harEndringer:
      harStemmekretsEndringer ||
      harGrunnkretsEndringer ||
      harBopliktomraadeEndringer ||
      harKommuneEndringer ||
      harEndringerUtenTilhorhget,
    laster:
      lasterStemmekretsEndringer ||
      lasterGrunnkretsEndringer ||
      lasterBopliktomraadeEndringer ||
      lasterKommuneEndringer,
    stemmekretsendringer: stemmekretsEndringer,
    grunnkretsendringer: grunnkretsEndringer,
    bopliktomraadeendringer: bopliktomraadeEndringer,
    endringerutentilhorighet: endringerUtenTilhorighet,
    kommunendringer: kommuneEndringer,
  };
};

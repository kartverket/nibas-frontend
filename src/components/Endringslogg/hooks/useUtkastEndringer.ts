import { UtkastResponse } from "types/api";
import {
  KommuneendringerForFylke,
  Kretsendringer,
  KretsendringerForKommune,
} from "components/Endringslogg/hooks/utkastEndringerTypes";
import {
  useUtkastGrunnkretsEndringer,
  useUtkastStemmekretsEndringer,
} from "components/Endringslogg/hooks/useUtkastKretsEndringer";
import { useUtkastKommuneEndringer } from "components/Endringslogg/hooks/useUtkastKommuneEndringer";
import { useUtkastUtenTilhorighetEndringer } from "components/Endringslogg/hooks/useUtkastUtenTilhorighetEndringer";

type UseUtkastEndringerReturnType = {
  laster: boolean;
  harEndringer: boolean;
  stemmekretsendringer: KretsendringerForKommune[] | null;
  grunnkretsendringer: KretsendringerForKommune[] | null;
  endringerutentilhorighet: Kretsendringer | null;
  kommunendringer: KommuneendringerForFylke[] | null;
};

export const useUtkastEndringer = (utkast: UtkastResponse): UseUtkastEndringerReturnType => {
  const {
    endringer: stemmekretsEndringer,
    harEndringer: harStemmekretsEndringer,
    laster: lasterStemmekretsEndringer,
  } = useUtkastStemmekretsEndringer(utkast);

  const {
    endringer: grunnkretsEndringer,
    harEndringer: harGrunnkretsEndringer,
    laster: lasterGrunnkretsEndringer,
  } = useUtkastGrunnkretsEndringer(utkast);

  const {
    endringer: kommuneEndringer,
    harEndringer: harKommuneEndringer,
    laster: lasterKommuneEndringer,
  } = useUtkastKommuneEndringer(utkast);

  const { endringer: endringerUtenTilhorighet, harEndringer: harEndringerUtenTilhorhget } =
    useUtkastUtenTilhorighetEndringer(utkast);

  return {
    harEndringer:
      harStemmekretsEndringer || harGrunnkretsEndringer || harKommuneEndringer || harEndringerUtenTilhorhget,
    laster: lasterStemmekretsEndringer || lasterGrunnkretsEndringer || lasterKommuneEndringer,
    stemmekretsendringer: stemmekretsEndringer,
    grunnkretsendringer: grunnkretsEndringer,
    endringerutentilhorighet: endringerUtenTilhorighet,
    kommunendringer: kommuneEndringer,
  };
};

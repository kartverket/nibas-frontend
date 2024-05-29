import { UtkastResponse } from "types/api";
import { KommuneendringerForFylke, KretsendringerForKommune } from "components/Endringslogg/hooks/utkastEndringerTypes";
import {
  useUtkastGrunnkretsEndringer,
  useUtkastStemmekretsEndringer,
} from "components/Endringslogg/hooks/useUtkastKretsEndringer";
import { useUtkastKommuneEndringer } from "components/Endringslogg/hooks/useUtkastKommuneEndringer";

type UseUtkastEndringerReturnType = {
  laster: boolean;
  harEndringer: boolean;
  stemmekretsendringer: KretsendringerForKommune[] | null;
  grunnkretsendringer: KretsendringerForKommune[] | null;
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

  return {
    harEndringer: harStemmekretsEndringer || harGrunnkretsEndringer || harKommuneEndringer,
    laster: lasterStemmekretsEndringer || lasterGrunnkretsEndringer || lasterKommuneEndringer,
    stemmekretsendringer: stemmekretsEndringer,
    grunnkretsendringer: grunnkretsEndringer,
    kommunendringer: kommuneEndringer,
  };
};

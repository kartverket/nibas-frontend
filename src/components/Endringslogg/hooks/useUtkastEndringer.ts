import { UtkastResponse } from "types/api";
import { Kretsendringer } from "components/Endringslogg/hooks/utkastEndringerTypes";
import {
  useUtkastGrunnkretsEndringer,
  useUtkastStemmekretsEndringer,
} from "components/Endringslogg/hooks/useUtkastKretsEndringer";

type UseUtkastEndringerReturnType = {
  laster: boolean;
  harEndringer: boolean;
  stemmekretsendringer: Kretsendringer<"STEMMEKRETS">[] | null;
  grunnkretsendringer: Kretsendringer<"GRUNNKRETS">[] | null;
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

  return {
    harEndringer: harStemmekretsEndringer || harGrunnkretsEndringer,
    laster: lasterStemmekretsEndringer || lasterGrunnkretsEndringer,
    stemmekretsendringer: stemmekretsEndringer,
    grunnkretsendringer: grunnkretsEndringer,
  };
};

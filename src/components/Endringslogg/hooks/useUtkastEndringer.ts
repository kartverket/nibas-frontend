import { useUtkastStemmekretsEndringer } from "./useUtkastStemmekretsEndringer";
import {
  Grunnkretsendringer,
  Stemmekretsendringer,
} from "./utkastEndringerTypes";
import { useUtkastGrunnkretsEndringer } from "./useUtkastGrunnkretsEndringer";
import { UtkastResponse } from "types/api";

type UseUtkastEndringerReturnType = {
  laster: boolean;
  harEndringer: boolean;
  stemmekretsendringer: Stemmekretsendringer[] | null;
  grunnkretsendringer: Grunnkretsendringer[] | null;
};

export const useUtkastEndringer = (
  utkast: UtkastResponse,
): UseUtkastEndringerReturnType => {
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

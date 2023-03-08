import { useUtkastStemmekretsEndringer } from "./useUtkastStemmekretsEndringer";
import {
  Grunnkretsendringer,
  Stemmekretsendringer,
} from "./utkastEndringerTypes";
import { useUtkastGrunnkretsEndringer } from "./useUtkastGrunnkretsEndringer";

type UseUtkastEndringerReturnType = {
  laster: boolean;
  harEndringer: boolean;
  stemmekretsendringer: Stemmekretsendringer[] | null;
  grunnkretsendringer: Grunnkretsendringer[] | null;
};

export const useUtkastEndringer = (): UseUtkastEndringerReturnType => {
  const {
    endringer: stemmekretsEndringer,
    harEndringer: harStemmekretsEndringer,
    laster: lasterStemmekretsEndringer,
  } = useUtkastStemmekretsEndringer();

  const {
    endringer: grunnkretsEndringer,
    harEndringer: harGrunnkretsEndringer,
    laster: lasterGrunnkretsEndringer,
  } = useUtkastGrunnkretsEndringer();

  return {
    harEndringer: harStemmekretsEndringer || harGrunnkretsEndringer,
    laster: lasterStemmekretsEndringer || lasterGrunnkretsEndringer,
    stemmekretsendringer: stemmekretsEndringer,
    grunnkretsendringer: grunnkretsEndringer,
  };
};

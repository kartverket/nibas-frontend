import { useUtkastStemmekretsEndringer } from "./useUtkastStemmekretsEndringer";
import { Stemmekretsendringer } from "./utkastEndringerTypes";

type UseUtkastEndringerReturnType = {
  laster: boolean;
  harEndringer: boolean;
  stemmekretsendringer: Stemmekretsendringer[] | null;
};

export const useUtkastEndringer = (): UseUtkastEndringerReturnType => {
  const {
    endringer: stemmekretsEndringer,
    harEndringer: harStemmekretsEndringer,
    laster: lasterStemmekretsEndringer,
  } = useUtkastStemmekretsEndringer();

  return {
    harEndringer: harStemmekretsEndringer,
    laster: lasterStemmekretsEndringer,
    stemmekretsendringer: stemmekretsEndringer,
  };
};

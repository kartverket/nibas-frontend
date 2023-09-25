import { Stemmekretsendringer } from "./utkastEndringerTypes";
import {
  getStemmekretserMedEndringer,
  getStemmekretsEndringer,
} from "./stemmekretsEndringerUtils";
import { useEffect, useMemo, useState } from "react";
import { useStemmekretser } from "hooks/inndelinger/useStemmekretser";
import useNibasApi from "hooks/useNibasApi";
import { UtkastResponse } from "types/api";

type useUtkastStemmekretsEndringerReturnType = {
  harEndringer: boolean;
  laster: boolean;
  endringer: Stemmekretsendringer[] | null;
};

export const useUtkastStemmekretsEndringer = (
  utkast: UtkastResponse
): useUtkastStemmekretsEndringerReturnType => {
  const [endringer, setEndringer] = useState<Stemmekretsendringer[] | null>(
    null
  );

  const { data: kommuner, isValidating: lasterKommuner } =
    useNibasApi("/v1/kommuner");
  const operasjoner = utkast.operasjoner;

  const stemmekretserMedEndringer = useMemo(() => {
    return getStemmekretserMedEndringer(operasjoner);
  }, [operasjoner]);

  const { data: stemmekretser, isValidating: lasterStemmekretser } =
    useStemmekretser(stemmekretserMedEndringer);

  const lasterData = lasterStemmekretser || lasterKommuner;

  useEffect(() => {
    if (!lasterData && stemmekretser && kommuner) {
      setEndringer(
        getStemmekretsEndringer(
          stemmekretserMedEndringer,
          operasjoner,
          stemmekretser,
          kommuner
        )
      );
    }
  }, [
    stemmekretserMedEndringer,
    operasjoner,
    kommuner,
    lasterData,
    stemmekretser,
  ]);

  return {
    harEndringer: stemmekretserMedEndringer.length > 0,
    laster: lasterData,
    endringer,
  };
};

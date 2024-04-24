import { useEffect, useMemo, useState } from "react";
import { useStemmekretser } from "hooks/inndelinger/useStemmekretser";
import useNibasApi from "hooks/useNibasApi";
import { UtkastResponse } from "types/api";
import { Kretsendringer, KretsType } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { getKretsEndringer, getKretserAvTypeMedEndringer } from "components/Endringslogg/hooks/endringer-utils";
import { useGrunnkretser } from "hooks/inndelinger/useGrunnkretser";

type useUtkastKretsEndringerReturnType<T extends KretsType> = {
  harEndringer: boolean;
  laster: boolean;
  endringer: Kretsendringer<T>[] | null;
};

export const useUtkastStemmekretsEndringer = (
  utkast: UtkastResponse,
): useUtkastKretsEndringerReturnType<"STEMMEKRETS"> => {
  const [endringer, setEndringer] = useState<Kretsendringer<"STEMMEKRETS">[] | null>(null);

  const { data: kommuner, isValidating: lasterKommuner } = useNibasApi("/v1/kommuner");
  const operasjoner = utkast.operasjoner;

  const stemmekretserMedEndringer = useMemo(() => {
    return getKretserAvTypeMedEndringer(operasjoner, "STEMMEKRETS");
  }, [operasjoner]);

  const { data: stemmekretser, isValidating: lasterStemmekretser } = useStemmekretser(stemmekretserMedEndringer);

  const lasterData = lasterStemmekretser || lasterKommuner;

  useEffect(() => {
    if (!lasterData && stemmekretser && kommuner) {
      setEndringer(getKretsEndringer(stemmekretserMedEndringer, operasjoner, stemmekretser, kommuner, "STEMMEKRETS"));
    }
  }, [stemmekretserMedEndringer, operasjoner, kommuner, lasterData, stemmekretser]);

  return {
    harEndringer: stemmekretserMedEndringer.length > 0,
    laster: lasterData,
    endringer,
  };
};

export const useUtkastGrunnkretsEndringer = (
  utkast: UtkastResponse,
): useUtkastKretsEndringerReturnType<"GRUNNKRETS"> => {
  const [endringer, setEndringer] = useState<Kretsendringer<"GRUNNKRETS">[] | null>(null);

  const { data: kommuner, isValidating: lasterKommuner } = useNibasApi("/v1/kommuner");
  const operasjoner = utkast.operasjoner;

  const grunnkretserMedEndringer = useMemo(() => {
    return getKretserAvTypeMedEndringer(operasjoner, "GRUNNKRETS");
  }, [operasjoner]);

  const { data: grunnkretser, isValidating: lasterGrunnkretser } = useGrunnkretser(grunnkretserMedEndringer);

  const lasterData = lasterGrunnkretser || lasterKommuner;

  useEffect(() => {
    if (!lasterData && grunnkretser && kommuner) {
      setEndringer(getKretsEndringer(grunnkretserMedEndringer, operasjoner, grunnkretser, kommuner, "GRUNNKRETS"));
    }
  }, [grunnkretserMedEndringer, operasjoner, kommuner, lasterData, grunnkretser]);

  return {
    harEndringer: grunnkretserMedEndringer.length > 0,
    laster: lasterData,
    endringer,
  };
};

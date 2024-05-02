import { useEffect, useMemo, useState } from "react";
import { useStemmekretser } from "hooks/inndelinger/useStemmekretser";
import useNibasApi from "hooks/useNibasApi";
import { UtkastResponse } from "types/api";
import {
  GrunnkretsMetadataendringer,
  Kretsendringer,
  Metadataendringer,
  StemmekretsMetadataendringer,
} from "components/Endringslogg/hooks/utkastEndringerTypes";
import {
  getGrunnkretsEndringer,
  getKretserAvTypeMedEndringer,
  getStemmekretsEndringer,
} from "components/Endringslogg/hooks/endringerUtils";
import { useGrunnkretser } from "hooks/inndelinger/useGrunnkretser";

type useUtkastKretsEndringerReturnType<KretsMetadataendringer extends Metadataendringer> = {
  harEndringer: boolean;
  laster: boolean;
  endringer: Kretsendringer<KretsMetadataendringer>[] | null;
};

export const useUtkastStemmekretsEndringer = (
  utkast: UtkastResponse,
): useUtkastKretsEndringerReturnType<StemmekretsMetadataendringer> => {
  const [endringer, setEndringer] = useState<Kretsendringer<StemmekretsMetadataendringer>[] | null>(null);

  const { data: kommuner, isValidating: lasterKommuner } = useNibasApi("/v1/kommuner");
  const operasjoner = utkast.operasjoner;

  const stemmekretserMedEndringer = useMemo(() => {
    return getKretserAvTypeMedEndringer(operasjoner, "STEMMEKRETS");
  }, [operasjoner]);

  const { data: stemmekretser, isValidating: lasterStemmekretser } = useStemmekretser(stemmekretserMedEndringer);

  const lasterData = lasterStemmekretser || lasterKommuner;

  useEffect(() => {
    if (!lasterData && stemmekretser && kommuner) {
      setEndringer(getStemmekretsEndringer(stemmekretserMedEndringer, operasjoner, stemmekretser, kommuner));
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
): useUtkastKretsEndringerReturnType<GrunnkretsMetadataendringer> => {
  const [endringer, setEndringer] = useState<Kretsendringer<GrunnkretsMetadataendringer>[] | null>(null);

  const { data: kommuner, isValidating: lasterKommuner } = useNibasApi("/v1/kommuner");
  const operasjoner = utkast.operasjoner;

  const grunnkretserMedEndringer = useMemo(() => {
    return getKretserAvTypeMedEndringer(operasjoner, "GRUNNKRETS");
  }, [operasjoner]);

  const { data: grunnkretser, isValidating: lasterGrunnkretser } = useGrunnkretser(grunnkretserMedEndringer);

  const lasterData = lasterGrunnkretser || lasterKommuner;

  useEffect(() => {
    if (!lasterData && grunnkretser && kommuner) {
      setEndringer(getGrunnkretsEndringer(grunnkretserMedEndringer, operasjoner, grunnkretser, kommuner));
    }
  }, [grunnkretserMedEndringer, operasjoner, kommuner, lasterData, grunnkretser]);

  return {
    harEndringer: grunnkretserMedEndringer.length > 0,
    laster: lasterData,
    endringer,
  };
};

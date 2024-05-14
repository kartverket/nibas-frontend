import { useEffect, useMemo, useState } from "react";
import { useStemmekretser } from "hooks/inndelinger/useStemmekretser";
import useNibasApi from "hooks/useNibasApi";
import { UtkastResponse } from "types/api";
import { KretsendringerForKommune } from "components/Endringslogg/hooks/utkastEndringerTypes";
import {
  getGrunnkretsEndringer,
  getKretserAvTypeMedEndringer,
  getStemmekretsEndringer,
} from "components/Endringslogg/hooks/endringerUtils";
import { useGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { KontekstType } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";

type useUtkastKretsEndringerReturnType = {
  harEndringer: boolean;
  laster: boolean;
  endringer: KretsendringerForKommune[] | null;
};

export const useUtkastStemmekretsEndringer = (utkast: UtkastResponse): useUtkastKretsEndringerReturnType => {
  const [endringer, setEndringer] = useState<KretsendringerForKommune[] | null>(null);

  const { data: kommuner, isValidating: lasterKommuner } = useNibasApi("/v1/kommuner");
  const operasjoner = utkast.operasjoner;

  const stemmekretserMedEndringer = useMemo(() => {
    return getKretserAvTypeMedEndringer(operasjoner, KontekstType.STEMMEKRETS);
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

export const useUtkastGrunnkretsEndringer = (utkast: UtkastResponse): useUtkastKretsEndringerReturnType => {
  const [endringer, setEndringer] = useState<KretsendringerForKommune[] | null>(null);

  const { data: kommuner, isValidating: lasterKommuner } = useNibasApi("/v1/kommuner");
  const operasjoner = utkast.operasjoner;

  const grunnkretserMedEndringer = useMemo(() => {
    return getKretserAvTypeMedEndringer(operasjoner, KontekstType.GRUNNKRETS);
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

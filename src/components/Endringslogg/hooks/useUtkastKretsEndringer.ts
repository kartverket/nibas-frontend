import { useMemo } from "react";
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
  const { data: kommuner, isValidating: lasterKommuner } = useNibasApi("/v1/kommuner");
  const operasjoner = utkast.operasjoner;

  const stemmekretserMedEndringer = useMemo(() => {
    return getKretserAvTypeMedEndringer(operasjoner, KontekstType.STEMMEKRETS);
  }, [operasjoner]);

  const { data: stemmekretser, isValidating: lasterStemmekretser } = useStemmekretser(stemmekretserMedEndringer);

  const lasterData = lasterStemmekretser || lasterKommuner;

  const endringer = useMemo(() => {
    if (!lasterData && stemmekretser && kommuner) {
      return getStemmekretsEndringer(stemmekretserMedEndringer, operasjoner, stemmekretser, kommuner);
    }
    return null;
  }, [lasterData, stemmekretserMedEndringer, stemmekretser, kommuner, operasjoner]);

  return {
    harEndringer: stemmekretserMedEndringer.length > 0,
    laster: lasterData,
    endringer,
  };
};

export const useUtkastGrunnkretsEndringer = (utkast: UtkastResponse): useUtkastKretsEndringerReturnType => {
  const { data: kommuner, isValidating: lasterKommuner } = useNibasApi("/v1/kommuner");
  const operasjoner = utkast.operasjoner;

  const grunnkretserMedEndringer = useMemo(() => {
    return getKretserAvTypeMedEndringer(operasjoner, KontekstType.GRUNNKRETS);
  }, [operasjoner]);

  const { data: grunnkretser, isValidating: lasterGrunnkretser } = useGrunnkretser(grunnkretserMedEndringer);

  const lasterData = lasterGrunnkretser || lasterKommuner;

  const endringer = useMemo(() => {
    if (!lasterData && grunnkretser && kommuner) {
      return getGrunnkretsEndringer(grunnkretserMedEndringer, operasjoner, grunnkretser, kommuner);
    }
    return null;
  }, [lasterData, grunnkretserMedEndringer, grunnkretser, kommuner, operasjoner]);

  return {
    harEndringer: grunnkretserMedEndringer.length > 0,
    laster: lasterData,
    endringer,
  };
};

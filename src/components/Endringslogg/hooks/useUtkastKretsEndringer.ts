import {
  getGrunnkretsEndringer,
  getKretserAvTypeMedEndringer,
  getStemmekretsEndringer,
} from "components/Endringslogg/hooks/endringerUtils";
import { KretsendringerForKommune } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { useGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import useKommuner from "hooks/inndelinger/useKommuner";
import { useStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { KontekstType } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import { useMemo } from "react";
import { UtkastResponse } from "types/api";

type useUtkastKretsEndringerReturnType = {
  harEndringer: boolean;
  laster: boolean;
  endringer: KretsendringerForKommune[] | null;
};

export const useUtkastStemmekretsEndringer = (
  utkast: UtkastResponse,
  shouldFetchEndringer: boolean = true,
): useUtkastKretsEndringerReturnType => {
  const { kommuner, isValidating: lasterKommuner } = useKommuner(null, utkast.gyldigFra, shouldFetchEndringer);
  const operasjoner = utkast.operasjoner;

  const stemmekretserMedEndringer = useMemo(() => {
    return getKretserAvTypeMedEndringer(operasjoner, KontekstType.STEMMEKRETS);
  }, [operasjoner]);

  const { data: stemmekretser, isValidating: lasterStemmekretser } = useStemmekretser(
    stemmekretserMedEndringer,
    utkast.gyldigFra,
    shouldFetchEndringer,
  );

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

export const useUtkastGrunnkretsEndringer = (
  utkast: UtkastResponse,
  shouldFetchEndringer: boolean = true,
): useUtkastKretsEndringerReturnType => {
  const { kommuner, isValidating: lasterKommuner } = useKommuner(null, utkast.gyldigFra, shouldFetchEndringer);
  const operasjoner = utkast.operasjoner;

  const grunnkretserMedEndringer = useMemo(() => {
    return getKretserAvTypeMedEndringer(operasjoner, KontekstType.GRUNNKRETS);
  }, [operasjoner]);

  const { data: grunnkretser, isValidating: lasterGrunnkretser } = useGrunnkretser(
    grunnkretserMedEndringer,
    utkast.gyldigFra,
    shouldFetchEndringer,
  );

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

import { useKommuneGrunnkretserRef } from "hooks/inndelinger/useGrunnkretser";
import { useKommuneStemmekretserRef } from "hooks/inndelinger/useStemmekretser";
import { Feature } from "ol";
import { useEffect } from "react";
import { GrunnkretsRef, StemmekretsRef } from "types/api";
import {
  KontekstType,
  TilhorighetOptions,
  UseTilhorighet,
  mapGrunnkretsRefToKrets,
  mapStemmekretRefToKrets,
} from "./tilhorighetUtils";
import { useTilhorighetForm } from "./useTilhorighetForm";

// Tar api respons for grunnkretser og stemmekretser og gir det tilbake på Krets typen pakket inn i TilhorighetOptions
const getMuligeKretserForCommonGrense = (
  kontekstType: KontekstType,
  grunnkretser: GrunnkretsRef[],
  stemmekretser: StemmekretsRef[],
): TilhorighetOptions => {
  if (kontekstType === KontekstType.STEMMEKRETS) {
    const mappedStemmekretser = mapStemmekretRefToKrets(stemmekretser);
    return {
      a: mappedStemmekretser,
      b: mappedStemmekretser,
    };
  } else {
    const mappedGrunnkretser = mapGrunnkretsRefToKrets(grunnkretser);
    return {
      a: mappedGrunnkretser,
      b: mappedGrunnkretser,
    };
  }
};

export const useTilhorighet = (feature: Feature): UseTilhorighet => {
  const {
    setTilhorighetOptions,
    tilhorighetOptions,
    registers,
    getValues,
    isDirty,
    resetTilhorighet,
    updateDraftFromFeature,
    kommunerId,
    kontekstType,
    setValue,
  } = useTilhorighetForm(feature);

  const { data: grunnkretser, isLoading: grunnkretserIsLoading } = useKommuneGrunnkretserRef(kommunerId[0]);
  const { data: stemmekretser, isLoading: stemmekretserIsLoading } = useKommuneStemmekretserRef(kommunerId[0]);

  useEffect(() => {
    if (grunnkretser && stemmekretser) {
      setTilhorighetOptions(getMuligeKretserForCommonGrense(kontekstType, grunnkretser, stemmekretser));
    }
  }, [grunnkretser, stemmekretser, kontekstType, setTilhorighetOptions]);

  return {
    kontekstType,
    tilhorighetOptions,
    isDirty,
    registers,
    resetTilhorighet,
    updateDraftFromFeature,
    getValues,
    isLoading: kontekstType === KontekstType.GRUNNKRETS ? grunnkretserIsLoading : stemmekretserIsLoading,
    setValue,
  };
};

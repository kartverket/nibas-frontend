import { useKommuneGrunnkretserRef } from "hooks/inndelinger/useGrunnkretser";
import { useKommuneStemmekretserRef } from "hooks/inndelinger/useStemmekretser";
import { Feature } from "ol";
import { useEffect } from "react";
import { GrunnkretsRef, StemmekretsRef } from "types/api";
import {
  KontekstType,
  TilhorighetOptions,
  getTilhorighetData,
  mapGrunnkretsRefToKrets,
  mapStemmekretRefToKrets,
} from "./tilhorighetUtils";
import { useTilhorighetForm } from "./useTilhorighetForm";

// Tar api respons for grunnkretser og stemmekretser og gir det tilbake på Krets typen pakket inn i TilhorighetOptions
const getMuligeKretserForGrense = (
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

export const useTilhorighet = (feature: Feature) => {
  const {
    setTilhorighetOptions,
    tilhorighetOptions,
    register,
    getValues,
    isDirty,
    resetTilhorighet,
    updateDraftFromFeature,
    kommunerId,
    kontekstType,
  } = useTilhorighetForm(feature);

  const { data: grunnkretser, isLoading: grunnkretserIsLoading } = useKommuneGrunnkretserRef(kommunerId[0]);
  const { data: stemmekretser, isLoading: stemmekretserIsLoading } = useKommuneStemmekretserRef(kommunerId[0]);

  useEffect(() => {
    if (grunnkretser && stemmekretser) {
      setTilhorighetOptions(getMuligeKretserForGrense(kontekstType, grunnkretser, stemmekretser));
    }
  }, [grunnkretser, stemmekretser, kontekstType, setTilhorighetOptions]);

  return {
    kontekstType,
    data: tilhorighetOptions,
    isDirty,
    register,
    resetTilhorighet,
    getTilhorighetData,
    updateDraftFromFeature,
    getValues,
    isLoading: kontekstType === KontekstType.GRUNNKRETS ? grunnkretserIsLoading : stemmekretserIsLoading,
  };
};

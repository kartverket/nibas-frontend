import { useToKommunerGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { useToKommunerStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { Feature } from "ol";
import { useEffect } from "react";
import { GrunnkretsRef, StemmekretsRef } from "types/api";
import {
  KontekstType,
  Tilhorighet,
  TilhorighetOptions,
  UseTilhorighet,
  mapGrunnkretsRefToKrets,
  mapStemmekretRefToKrets,
} from "./tilhorighetUtils";
import { useTilhorighetForm } from "./useTilhorighetForm";

const getMuligeKretserForAdministrativGrense = (
  kontekstType: KontekstType,
  grunnkretser: [GrunnkretsRef[], GrunnkretsRef[]],
  stemmekretser: [StemmekretsRef[], StemmekretsRef[]],
): TilhorighetOptions => {
  switch (kontekstType) {
    case KontekstType.GRUNNKRETS:
      return {
        [Tilhorighet.A]: mapGrunnkretsRefToKrets(grunnkretser[0]),
        [Tilhorighet.B]: mapGrunnkretsRefToKrets(grunnkretser[1]),
      };
    case KontekstType.STEMMEKRETS:
      return {
        [Tilhorighet.A]: mapStemmekretRefToKrets(stemmekretser[0]),
        [Tilhorighet.B]: mapStemmekretRefToKrets(stemmekretser[1]),
      };
  }
};

export const useAdministrativTilhorighet = (feature: Feature): UseTilhorighet => {
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

  const {
    kommuneA: grunnkretserA,
    kommuneB: grunnkretserB,
    grunnkretserIsLoading,
  } = useToKommunerGrunnkretser(kommunerId[0], kommunerId[1]);
  const {
    kommuneA: stemmekretserA,
    kommuneB: stemmekretserB,
    stemmekretserIsLoading,
  } = useToKommunerStemmekretser(kommunerId[0], kommunerId[1]);

  useEffect(() => {
    if (grunnkretserA && grunnkretserB && stemmekretserA && stemmekretserB) {
      setTilhorighetOptions(
        getMuligeKretserForAdministrativGrense(
          kontekstType,
          [grunnkretserA, grunnkretserB],
          [stemmekretserA, stemmekretserB],
        ),
      );
    }
  }, [kontekstType, grunnkretserA, grunnkretserB, stemmekretserA, stemmekretserB, setTilhorighetOptions]);

  return {
    kontekstType,
    tilhorighetOptions,
    isDirty,
    register,
    resetTilhorighet,
    updateDraftFromFeature,
    getValues,
    isLoading: kontekstType === KontekstType.GRUNNKRETS ? grunnkretserIsLoading : stemmekretserIsLoading,
  };
};

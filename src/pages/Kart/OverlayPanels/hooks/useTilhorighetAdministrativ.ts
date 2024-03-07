import { useToKommunerGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { useToKommunerStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { Feature } from "ol";
import { useEffect } from "react";
import {
  KontekstType,
  Tilhorighet,
  TilhorighetOptions,
  UseTilhorighet,
  mapGrunnkretsResponseToKrets,
  mapStemmekretResponseToKrets,
} from "./tilhorighetUtils";
import { useTilhorighetForm } from "./useTilhorighetForm";
import { GrunnkretsResponse, StemmekretsResponse } from "../../../../types/api";

const getMuligeKretserForAdministrativGrense = (
  kontekstType: KontekstType,
  grunnkretser: [GrunnkretsResponse[], GrunnkretsResponse[]],
  stemmekretser: [StemmekretsResponse[], StemmekretsResponse[]],
): TilhorighetOptions => {
  switch (kontekstType) {
    case KontekstType.GRUNNKRETS:
      return {
        [Tilhorighet.A]: mapGrunnkretsResponseToKrets(grunnkretser[0]),
        [Tilhorighet.B]: mapGrunnkretsResponseToKrets(grunnkretser[1]),
      };
    case KontekstType.STEMMEKRETS:
      return {
        [Tilhorighet.A]: mapStemmekretResponseToKrets(stemmekretser[0]),
        [Tilhorighet.B]: mapStemmekretResponseToKrets(stemmekretser[1]),
      };
  }
};

export const useTilhorighetAdministrativ = (feature: Feature): UseTilhorighet => {
  const { setTilhorighetOptions, tilhorighetOptions, kommunerId, kontekstType } = useTilhorighetForm(feature);

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
    isLoading: kontekstType === KontekstType.GRUNNKRETS ? grunnkretserIsLoading : stemmekretserIsLoading,
  };
};

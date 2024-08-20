import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { Feature } from "ol";
import { useEffect } from "react";
import {
  KontekstType,
  TilhorighetOptions,
  UseTilhorighet,
  mapGrunnkretsResponseToKrets,
  mapStemmekretResponseToKrets,
} from "./tilhorighet-utils";
import { useTilhorighetForm } from "./useTilhorighetForm";
import { GrunnkretsResponse, StemmekretsResponse } from "../../../../types/api";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";

// Tar api respons for grunnkretser og stemmekretser og gir det tilbake på Krets typen pakket inn i TilhorighetOptions
const getMuligeKretserForCommonGrense = (
  kontekstType: KontekstType,
  grunnkretser: GrunnkretsResponse[],
  stemmekretser: StemmekretsResponse[],
): TilhorighetOptions => {
  if (kontekstType === KontekstType.STEMMEKRETS) {
    const mappedStemmekretser = mapStemmekretResponseToKrets(stemmekretser);
    return {
      a: mappedStemmekretser,
      b: mappedStemmekretser,
    };
  } else {
    const mappedGrunnkretser = mapGrunnkretsResponseToKrets(grunnkretser);
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
    formState,
    setValue,
    isDirty,
    resetTilhorighet,
    kommunerId,
    kontekstType,
    getCurrentOppdaterteKontekstEgenskaper,
  } = useTilhorighetForm(feature);
  const { gyldighetsdato } = useValgtGyldighetsdato();

  const { data: grunnkretser, isLoading: grunnkretserIsLoading } = useKommuneGrunnkretser(
    kommunerId[0] ?? null,
    gyldighetsdato,
  );
  const { data: stemmekretser, isLoading: stemmekretserIsLoading } = useKommuneStemmekretser(
    kommunerId[0] ?? null,
    gyldighetsdato,
  );

  useEffect(() => {
    if (grunnkretser && stemmekretser) {
      setTilhorighetOptions(getMuligeKretserForCommonGrense(kontekstType, grunnkretser, stemmekretser));
    }
  }, [grunnkretser, stemmekretser, kontekstType, setTilhorighetOptions]);

  return {
    kontekstType,
    tilhorighetOptions,
    isDirty,
    resetTilhorighet,
    formState,
    setValue,
    isLoading: kontekstType === KontekstType.GRUNNKRETS ? grunnkretserIsLoading : stemmekretserIsLoading,
    getCurrentOppdaterteKontekstEgenskaper,
  };
};

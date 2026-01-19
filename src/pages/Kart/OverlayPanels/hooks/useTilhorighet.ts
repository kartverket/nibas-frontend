import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { Feature } from "ol";
import { useEffect } from "react";
import {
  TilhorighetOptions,
  UseTilhorighet,
  mapBopliktomraadeResponseToKrets,
  mapGrunnkretsResponseToKrets,
  mapStemmekretResponseToKrets,
} from "./tilhorighet-utils";
import { useTilhorighetForm } from "./useTilhorighetForm";
import { BopliktomraadeResponse, GrunnkretsResponse, StemmekretsResponse } from "../../../../types/api";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { KretsType } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { useKommuneBopliktomraade } from "hooks/inndelinger/useBopliktomraader";

// Tar api respons for kretser av en gitt type og gir det tilbake på Krets typen pakket inn i TilhorighetOptions
const getMuligeKretserForCommonGrense = (
  kretsType: KretsType,
  grunnkretser: GrunnkretsResponse[],
  stemmekretser: StemmekretsResponse[],
  bopliktomraader: BopliktomraadeResponse[],
): TilhorighetOptions => {
  switch (kretsType) {
    case KretsType.STEMMEKRETS:
      return {
        a: mapStemmekretResponseToKrets(stemmekretser),
        b: mapStemmekretResponseToKrets(stemmekretser),
      };
    case KretsType.GRUNNKRETS:
      return {
        a: mapGrunnkretsResponseToKrets(grunnkretser),
        b: mapGrunnkretsResponseToKrets(grunnkretser),
      };
    case KretsType.BOPLIKTOMRAADE:
      return {
        a: mapBopliktomraadeResponseToKrets(bopliktomraader),
        b: mapBopliktomraadeResponseToKrets(bopliktomraader),
      };
    default:
      throw new Error(`Ugyldig krets type: ${kretsType}`);
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
    kommunerIds,
    kretsType,
    getCurrentOppdaterteKontekstEgenskaper,
    isLoading,
  } = useTilhorighetForm(feature);
  const { gyldighetsdato } = useValgtGyldighetsdato();

  const { data: grunnkretser, isLoading: grunnkretserIsLoading } = useKommuneGrunnkretser(
    kommunerIds[0] ?? null,
    gyldighetsdato,
  );
  const { data: stemmekretser, isLoading: stemmekretserIsLoading } = useKommuneStemmekretser(
    kommunerIds[0] ?? null,
    gyldighetsdato,
  );

  const { data: bopliktomraader, isLoading: bopliktomraaderIsLoading } = useKommuneBopliktomraade(
    kommunerIds[0] ?? null,
    gyldighetsdato,
  );

  useEffect(() => {
    if (grunnkretser && stemmekretser && bopliktomraader) {
      setTilhorighetOptions(getMuligeKretserForCommonGrense(kretsType, grunnkretser, stemmekretser, bopliktomraader));
    }
  }, [grunnkretser, stemmekretser, bopliktomraader, kretsType, setTilhorighetOptions]);

  return {
    kretsType,
    tilhorighetOptions,
    isDirty,
    resetTilhorighet,
    formState,
    setValue,
    isLoading:
      kretsType === KretsType.GRUNNKRETS
        ? grunnkretserIsLoading
        : kretsType === KretsType.STEMMEKRETS
          ? stemmekretserIsLoading
          : bopliktomraaderIsLoading || isLoading,
    getCurrentOppdaterteKontekstEgenskaper,
  };
};

import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { Feature } from "ol";
import { useEffect } from "react";
import {
  TilhorighetInndelingtype,
  TilhorighetOptions,
  UseTilhorighet,
  mapBopliktomraadeResponseToKrets,
  mapGrunnkretsResponseToKrets,
  mapStemmekretResponseToKrets,
} from "./tilhorighet-utils";
import { useTilhorighetForm } from "./useTilhorighetForm";
import { BopliktomraadeResponse, GrunnkretsResponse, StemmekretsResponse } from "../../../../types/api";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { useKommuneBopliktomraade } from "hooks/inndelinger/useBopliktomraader";

// Tar api respons for kretser av en gitt type og gir det tilbake på Krets typen pakket inn i TilhorighetOptions
const getMuligeKretserForCommonGrense = (
  inndelingType: TilhorighetInndelingtype,
  grunnkretser: GrunnkretsResponse[],
  stemmekretser: StemmekretsResponse[],
  bopliktomraader: BopliktomraadeResponse[],
): TilhorighetOptions => {
  switch (inndelingType) {
    case "STEMMEKRETS":
      return {
        a: mapStemmekretResponseToKrets(stemmekretser),
        b: mapStemmekretResponseToKrets(stemmekretser),
      };
    case "GRUNNKRETS":
      return {
        a: mapGrunnkretsResponseToKrets(grunnkretser),
        b: mapGrunnkretsResponseToKrets(grunnkretser),
      };
    case "BOPLIKTOMRAADE":
      return {
        a: mapBopliktomraadeResponseToKrets(bopliktomraader),
        b: mapBopliktomraadeResponseToKrets(bopliktomraader),
      };
    default:
      throw new Error(`Ugyldig inndelingtype: ${inndelingType}`);
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
    inndelingType,
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
      setTilhorighetOptions(
        getMuligeKretserForCommonGrense(inndelingType, grunnkretser, stemmekretser, bopliktomraader),
      );
    }
  }, [grunnkretser, stemmekretser, bopliktomraader, inndelingType, setTilhorighetOptions]);

  return {
    inndelingType,
    tilhorighetOptions,
    isDirty,
    resetTilhorighet,
    formState,
    setValue,
    isLoading:
      inndelingType === "GRUNNKRETS"
        ? grunnkretserIsLoading
        : inndelingType === "STEMMEKRETS"
          ? stemmekretserIsLoading
          : bopliktomraaderIsLoading || isLoading,
    getCurrentOppdaterteKontekstEgenskaper,
  };
};

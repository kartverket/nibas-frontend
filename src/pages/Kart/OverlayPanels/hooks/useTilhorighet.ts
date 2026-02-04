import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import useKommuneInndelinger, { KommunalInndelingResponse } from "hooks/inndelinger/useKommuneInndelinger";
import { Feature } from "ol";
import { useEffect } from "react";
import {
  TilhorighetInndelingtype,
  TilhorighetOptions,
  UseTilhorighet,
  mapKommunalInndelingResponseToKrets,
} from "./tilhorighet-utils";
import { useTilhorighetForm } from "./useTilhorighetForm";

// Tar api respons for kretser av en gitt type og gir det tilbake på Krets typen pakket inn i TilhorighetOptions
const getMuligeKretserForCommonGrense = (
  inndelingType: TilhorighetInndelingtype,
  inndelinger: KommunalInndelingResponse[],
): TilhorighetOptions => {
  const kretser = mapKommunalInndelingResponseToKrets(inndelinger, inndelingType);
  return {
    a: kretser,
    b: kretser,
  };
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

  const kommuneId = kommunerIds[0];
  const { data: inndelinger, isLoading: isLoadingInndelinger } = useKommuneInndelinger(
    kommuneId,
    gyldighetsdato,
    inndelingType,
  );

  useEffect(() => {
    if (inndelinger) {
      setTilhorighetOptions(getMuligeKretserForCommonGrense(inndelingType, inndelinger));
    }
  }, [inndelinger, inndelingType, setTilhorighetOptions]);

  return {
    inndelingType,
    tilhorighetOptions,
    isDirty,
    resetTilhorighet,
    formState,
    setValue,
    isLoading: isLoadingInndelinger || isLoading,
    getCurrentOppdaterteKontekstEgenskaper,
  };
};

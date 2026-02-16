import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import useKommuneInndelinger, { KommunalInndelingResponse } from "hooks/inndelinger/useKommuneInndelinger";
import { Feature } from "ol";
import { useCallback, useMemo } from "react";
import {
  TilhorighetInndelingtype,
  TilhorighetOptions,
  UseTilhorighet,
  getUpdatedKontekstEgenskaper,
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
    formState,
    setValue,
    isDirty,
    resetTilhorighet,
    kommunerIds,
    inndelingType,
    buildTilhorighetOptions,
    isLoading: isLoadingForm,
  } = useTilhorighetForm(feature);
  const { gyldighetsdato } = useValgtGyldighetsdato();

  const kommuneId = kommunerIds[0];
  const { data: inndelinger, isLoading: isLoadingInndelinger } = useKommuneInndelinger(
    kommuneId,
    gyldighetsdato,
    inndelingType,
  );

  const tilhorighetOptions = useMemo(
    () =>
      buildTilhorighetOptions(inndelinger ? getMuligeKretserForCommonGrense(inndelingType, inndelinger) : undefined),
    [inndelinger, inndelingType, buildTilhorighetOptions],
  );

  const getCurrentOppdaterteKontekstEgenskaper = useCallback(
    () =>
      tilhorighetOptions
        ? getUpdatedKontekstEgenskaper(inndelingType, formState[inndelingType], tilhorighetOptions)
        : undefined,
    [tilhorighetOptions, inndelingType, formState],
  );

  return {
    inndelingType,
    tilhorighetOptions,
    isDirty,
    resetTilhorighet,
    formState,
    setValue,
    isLoading: isLoadingInndelinger || isLoadingForm,
    getCurrentOppdaterteKontekstEgenskaper,
  };
};

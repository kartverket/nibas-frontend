import { Feature } from "ol";
import { useEffect, useMemo } from "react";
import { useInndelinger } from "../../../../contexts/InndelingerContext/InndelingerContext";
import { FeatureProperties } from "../../../../types/api";
import {
  CustomOption,
  getKommunerIdFromKontekstEgenskaper,
  KontekstType,
  Tilhorighet,
  UseTilhorighet,
} from "./tilhorighet-utils";
import { useGetMuligeKretserForAdministrativGrense } from "./useGetMuligeKretserForAdministrativGrense";
import { useTilhorighetForm } from "./useTilhorighetForm";

export const useAdministrativTilhorighet = (feature: Feature, kontekstType: KontekstType): UseTilhorighet => {
  const {
    setTilhorighetOptions,
    tilhorighetOptions,
    formState,
    setValue,
    isDirty,
    resetTilhorighet,
    getCurrentOppdaterteKontekstEgenskaper,
  } = useTilhorighetForm(feature, kontekstType);
  const { currentlyEditingInndelinger } = useInndelinger();

  const kommunerId = useMemo(
    () =>
      getKommunerIdFromKontekstEgenskaper(
        (feature.getProperties() as FeatureProperties).kontekstEgenskaper.filter(
          (k) => k.id?.lokalid.value !== CustomOption.NOT_CHOSEN,
        ),
        kontekstType,
      ) ?? [currentlyEditingInndelinger?.[0] != null ? currentlyEditingInndelinger[0].id : ""],
    [feature, kontekstType, currentlyEditingInndelinger],
  );

  const { isLoading: isLoadingA, muligeKretser: muligeKretserA } = useGetMuligeKretserForAdministrativGrense(
    kontekstType,
    kommunerId[0],
  );
  const { isLoading: isLoadingB, muligeKretser: muligeKretserB } = useGetMuligeKretserForAdministrativGrense(
    kontekstType,
    kommunerId[1],
  );

  const muligeKretser = useMemo(
    () =>
      muligeKretserA
        .concat(muligeKretserB)
        .toSorted((kretsA, kretsB) => Number(kretsA.kommunenummer) - Number(kretsB.kommunenummer)),
    [muligeKretserA, muligeKretserB],
  );

  useEffect(() => {
    setTilhorighetOptions({
      [Tilhorighet.A]: muligeKretser,
      [Tilhorighet.B]: muligeKretser,
    });
  }, [muligeKretser, setTilhorighetOptions]);

  return {
    kontekstType,
    tilhorighetOptions,
    isDirty,
    resetTilhorighet,
    formState,
    setValue,
    isLoading: isLoadingA || isLoadingB,
    getCurrentOppdaterteKontekstEgenskaper,
  };
};

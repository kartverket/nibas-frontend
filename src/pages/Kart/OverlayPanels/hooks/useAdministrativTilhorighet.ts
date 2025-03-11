import { Feature } from "ol";
import { useEffect, useMemo } from "react";
import { useInndelinger } from "../../../../contexts/InndelingerContext/InndelingerContext";
import { FeatureProperties } from "../../../../types/api";
import {
  CustomOption,
  getKommunerIdFromKontekstEgenskaper,
  KontekstType,
  mapGrunnkretsResponseToKrets,
  mapStemmekretResponseToKrets,
  Tilhorighet,
  UseTilhorighet,
} from "./tilhorighet-utils";
import { useTilhorighetForm } from "./useTilhorighetForm";
import { useValgtGyldighetsdato } from "../../../../contexts/GyldighetsdatoContext";
import useNibasApi from "../../../../hooks/useNibasApi";

const useGetMuligeKretserForAdministrativGrense = (
  kontekstType: KontekstType,
  kommuneId: string | null | undefined,
) => {
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const urlForKrets =
    kontekstType === KontekstType.GRUNNKRETS ? "/v1/kommuner/{id}/grunnkretser" : "/v1/kommuner/{id}/stemmekretser";
  const url = kommuneId != null ? urlForKrets : null;

  const { data, isLoading } = useNibasApi(url, { id: kommuneId!, gyldighetsdato });

  const kretserForFylket = useMemo(() => {
    if (data == null) {
      return [];
    }

    switch (kontekstType) {
      case KontekstType.STEMMEKRETS:
        return mapStemmekretResponseToKrets(data);
      case KontekstType.GRUNNKRETS:
        return mapGrunnkretsResponseToKrets(data);
    }
  }, [kontekstType, data]);

  return {
    muligeKretser: kretserForFylket,
    isLoading,
  };
};

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

  const muligeKretser = useMemo(() => muligeKretserA.concat(muligeKretserB), [muligeKretserA, muligeKretserB]);

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

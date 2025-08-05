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
    isLoading,
  } = useTilhorighetForm(feature, kontekstType);
  const { currentlyEditingInndelinger } = useInndelinger();

  // Sjekker både kontekstEgenskaper og currentlyEditingInndelinger for å få med alle kommunerId
  const kommunerId = () => {
    const fromKontekst =
      getKommunerIdFromKontekstEgenskaper(
        (feature.getProperties() as FeatureProperties).kontekstEgenskaper.filter(
          (k) => k.id?.lokalid.value !== CustomOption.NOT_CHOSEN,
        ),
        kontekstType,
      ) ?? [];
    const fromInndelinger = currentlyEditingInndelinger?.map((i) => i.id) ?? [];
    // Slå sammen kommuneid'er fra kontekstegenskaper og inndelinger og fjern duplikater
    const allIds = Array.from(new Set([...fromKontekst, ...fromInndelinger]));
    return allIds.length > 0 ? allIds : [""];
  };

  const kommunerIds = kommunerId();

  const { isLoading: isLoadingA, muligeKretser: muligeKretserA } = useGetMuligeKretserForAdministrativGrense(
    kontekstType,
    kommunerIds[0],
  );
  const { isLoading: isLoadingB, muligeKretser: muligeKretserB } = useGetMuligeKretserForAdministrativGrense(
    kontekstType,
    kommunerIds[1],
  );

  useEffect(() => {
    const muligeKretser = muligeKretserA.concat(muligeKretserB);
    setTilhorighetOptions({
      [Tilhorighet.A]: muligeKretser,
      [Tilhorighet.B]: muligeKretser,
    });
  }, [muligeKretserA, muligeKretserB, setTilhorighetOptions]);

  return {
    kontekstType,
    tilhorighetOptions,
    isDirty,
    resetTilhorighet,
    formState,
    setValue,
    isLoading: isLoadingA || isLoadingB || isLoading,
    getCurrentOppdaterteKontekstEgenskaper,
  };
};

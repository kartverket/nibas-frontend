import { Feature } from "ol";
import { useEffect, useState } from "react";
import {
  KontekstType,
  Krets,
  mapGrunnkretsResponseToKrets,
  mapStemmekretResponseToKrets,
  Tilhorighet,
  UseTilhorighet,
} from "./tilhorighet-utils";
import { useTilhorighetForm } from "./useTilhorighetForm";
import { FeatureProperties, GrunnkretsResponse, StemmekretsResponse } from "../../../../types/api";
import { fetcherWithToken } from "utils/api";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { getUrlWithParameters } from "hooks/useNibasApi";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";

const getTilhorigheterForFeatureAvType = (
  feature: Feature,
  kontekstType: KontekstType,
  gyldighetsdato: string | undefined,
  authToken: string | undefined,
): Promise<Krets[]> => {
  const featureProperties = feature.getProperties() as FeatureProperties;
  const tilhorigheterAvRiktigType = featureProperties.kontekstEgenskaper.filter(
    (k) => k.type === kontekstType.valueOf(),
  );
  const path = kontekstType === KontekstType.GRUNNKRETS ? "/v1/grunnkretser/{id}" : "/v1/stemmekretser/{id}";
  const promises = tilhorigheterAvRiktigType.map((tilhorighet) =>
    fetcherWithToken([
      getUrlWithParameters(path, { id: tilhorighet.id?.lokalid.value ?? "", gyldighetsdato }),
      authToken,
    ]),
  );

  return Promise.all(promises).then((result: StemmekretsResponse[] | GrunnkretsResponse[]) => {
    switch (kontekstType) {
      case KontekstType.GRUNNKRETS:
        return mapGrunnkretsResponseToKrets(result);
      case KontekstType.STEMMEKRETS:
        return mapStemmekretResponseToKrets(result);
    }
  });
};

export const useTilhorighetIkkeRedigerbar = (feature: Feature, kontekstType: KontekstType): UseTilhorighet => {
  const {
    setTilhorighetOptions,
    tilhorighetOptions,
    formState,
    setValue,
    isDirty,
    resetTilhorighet,
    getCurrentOppdaterteKontekstEgenskaper,
  } = useTilhorighetForm(feature, kontekstType);

  const { gyldighetsdato } = useValgtGyldighetsdato();
  const { token } = useAuthentication();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getTilhorigheterForFeatureAvType(feature, kontekstType, gyldighetsdato, token).then((kretser) => {
      setTilhorighetOptions({
        [Tilhorighet.A]: kretser,
        [Tilhorighet.B]: kretser,
      });
      setIsLoading(false);
    });
  }, [feature, gyldighetsdato, kontekstType, setTilhorighetOptions, token]);

  return {
    kontekstType,
    tilhorighetOptions,
    isDirty,
    resetTilhorighet,
    formState,
    setValue,
    isLoading,
    getCurrentOppdaterteKontekstEgenskaper,
  };
};

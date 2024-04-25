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

const getTilhorigheterForFeatureAvType = (
  feature: Feature,
  kontekstType: KontekstType,
  authToken: string | undefined,
): Promise<Krets[]> => {
  const featureProperties = feature.getProperties() as FeatureProperties;
  const tilhorigheterAvRiktigType = featureProperties.kontekstEgenskaper.filter(
    (k) => k.type === kontekstType.valueOf(),
  );
  const path = kontekstType === KontekstType.GRUNNKRETS ? "/v1/grunnkretser/" : "/v1/stemmekretser/";
  const promises = tilhorigheterAvRiktigType.map((tilhorighet) =>
    fetcherWithToken([path + tilhorighet.id?.lokalid.value, authToken]),
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
    updateDraftFromFeature,
  } = useTilhorighetForm(feature, kontekstType);

  const { token } = useAuthentication();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getTilhorigheterForFeatureAvType(feature, kontekstType, token).then((kretser) => {
      setTilhorighetOptions({
        [Tilhorighet.A]: kretser,
        [Tilhorighet.B]: kretser,
      });
      setIsLoading(false);
    });
  }, [feature, kontekstType, setTilhorighetOptions, token]);

  return {
    kontekstType,
    tilhorighetOptions,
    isDirty,
    resetTilhorighet,
    updateDraftFromFeature,
    formState,
    setValue,
    isLoading,
  };
};

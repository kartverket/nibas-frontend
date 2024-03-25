import { useGrunnkretser, useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { useKommuneStemmekretser, useStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { Feature } from "ol";
import { useEffect, useMemo } from "react";
import { FeatureProperties, KontekstEgenskaper, GrunnkretsResponse, StemmekretsResponse } from "types/api";
import {
  CustomOption,
  KontekstType,
  Krets,
  Tilhorighet,
  UseTilhorighet,
  sortKretserOptionsByNumber,
  mapGrunnkretsResponseToKrets,
  mapStemmekretResponseToKrets,
} from "./tilhorighet-utils";
import { useTilhorighetForm } from "./useTilhorighetForm";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import { editSource } from "hooks/layers/constants";
import { Geometry } from "ol/geom";
import { isAdministrativGrense } from "utils/grenser";
import { isGrenseType } from "utils/type-utils";

const getAdministrativeFeatures = (features: Feature<Geometry>[]) => {
  return features.filter((feature) => {
    const properties = feature.getProperties() as FeatureProperties;
    const grenseType = properties.type;
    return isGrenseType(grenseType) && isAdministrativGrense(grenseType);
  });
};

const filterKontekstEgenskaperOnType = (egenskaper: KontekstEgenskaper[], type: string) => {
  return egenskaper
    .filter((egenskap) => egenskap.type === type)
    .map((egenskap) => egenskap.id?.lokalid.value ?? "")
    .filter((egenskap, index, workingList) => workingList.indexOf(egenskap) === index)
    .filter((id) => id.length > 0 && id !== CustomOption.NOT_CHOSEN);
};

const useGetMuligeKretserForNyAdministrativGrense = (
  kontekstType: KontekstType,
  grunnkretserFromContext: GrunnkretsResponse[],
  stemmekretserFromContext: StemmekretsResponse[],
) => {
  const administrativeFeatures = getAdministrativeFeatures(editSource.getFeatures());

  const kontekstEgenskaperForAdministrativeFeatures = administrativeFeatures.flatMap(
    (feature) => (feature.getProperties() as FeatureProperties).kontekstEgenskaper,
  );

  const grunnkretsKontekstEgenskapIDer = filterKontekstEgenskaperOnType(
    kontekstEgenskaperForAdministrativeFeatures,
    "GRUNNKRETS",
  );

  const stemmekretsKontekstEgenskapIDer = filterKontekstEgenskaperOnType(
    kontekstEgenskaperForAdministrativeFeatures,
    "STEMMEKRETS",
  );

  const { data: grunnkretserIfExists } = useGrunnkretser(grunnkretsKontekstEgenskapIDer);
  const { data: stemmekretserIfExists } = useStemmekretser(stemmekretsKontekstEgenskapIDer);

  return useMemo(() => {
    if (!grunnkretserIfExists && !stemmekretserIfExists) return null;
    const grunnkretserFraGrenseKontekstegenskaper = grunnkretserIfExists?.map((grunnkrets) => {
      return {
        id: grunnkrets.id,
        kommuneId: grunnkrets.kommuneIdentifikator,
        navn: grunnkrets.navn,
        nummer: grunnkrets.nummer,
        type: "GRUNNKRETS",
        version: grunnkrets.version,
      } as Krets;
    });

    const stemmekretserFraGrenseKontekstEgenskaper = stemmekretserIfExists?.map((stemmekrets) => {
      return {
        id: stemmekrets.id,
        kommuneId: stemmekrets.kommuneIdentifikator,
        navn: stemmekrets.navn,
        nummer: stemmekrets.nummer,
        type: "STEMMEKRETS",
        version: stemmekrets.version,
      } as Krets;
    });

    const fullGrunnkretser = mapGrunnkretsResponseToKrets(grunnkretserFromContext).concat(
      sortKretserOptionsByNumber(grunnkretserFraGrenseKontekstegenskaper),
    );

    const fullStemmekretser = mapStemmekretResponseToKrets(stemmekretserFromContext).concat(
      sortKretserOptionsByNumber(stemmekretserFraGrenseKontekstEgenskaper),
    );

    switch (kontekstType) {
      case KontekstType.GRUNNKRETS: {
        return {
          [Tilhorighet.A]: fullGrunnkretser,
          [Tilhorighet.B]: fullGrunnkretser,
        };
      }
      case KontekstType.STEMMEKRETS: {
        return {
          [Tilhorighet.A]: fullStemmekretser,
          [Tilhorighet.B]: fullStemmekretser,
        };
      }
    }
  }, [grunnkretserFromContext, grunnkretserIfExists, kontekstType, stemmekretserFromContext, stemmekretserIfExists]);
};

export const useTilhorighetNyAdministrativ = (feature: Feature): UseTilhorighet => {
  const {
    setTilhorighetOptions,
    tilhorighetOptions,
    register,
    getValues,
    isDirty,
    resetTilhorighet,
    updateDraftFromFeature,
    kommunerId,
    kontekstType,
  } = useTilhorighetForm(feature);

  // Vet setting av tilhørighet på nye grenser så er det ikke mulig å utlede hvilke muligheter man skal ha for endring av tilhørighet,
  // siden kontekstegenskapene ikke er satt. kommunerId blir da satt til en fallback som er den kommunen man aktivt redigerer
  // Vi kan da hente kretsene til den kommunen som blir satt som fallback, hente kontekstegenskapene som er satt på
  // alle administrative grenser og gjøre dette til de andre mulige tilhørighetvalgene
  const { data: grunnkretserFromContext } = useKommuneGrunnkretser(kommunerId[0] ?? null);
  const { data: stemmekreterFromContext } = useKommuneStemmekretser(kommunerId[0] ?? null);

  const muligeKretserForNyGrense = useGetMuligeKretserForNyAdministrativGrense(
    kontekstType,
    grunnkretserFromContext ?? [],
    stemmekreterFromContext ?? [],
  );

  useEffect(() => {
    if (isTempFeatureId(feature.getId())) {
      if (grunnkretserFromContext && stemmekreterFromContext && muligeKretserForNyGrense) {
        setTilhorighetOptions(muligeKretserForNyGrense);
      }
      return;
    }
  }, [
    feature,
    grunnkretserFromContext,
    kontekstType,
    muligeKretserForNyGrense,
    setTilhorighetOptions,
    stemmekreterFromContext,
  ]);

  return {
    kontekstType,
    tilhorighetOptions,
    isDirty,
    register,
    resetTilhorighet,
    updateDraftFromFeature,
    getValues,
    isLoading: muligeKretserForNyGrense ? false : true,
  };
};

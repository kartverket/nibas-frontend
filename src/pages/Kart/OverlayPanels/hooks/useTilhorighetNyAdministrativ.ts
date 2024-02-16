import { useGrunnkretser, useKommuneGrunnkretserRef } from "hooks/inndelinger/useGrunnkretser";
import { useKommuneStemmekretserRef, useStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { Feature } from "ol";
import { useEffect, useMemo } from "react";
import { FeatureProperties, GrunnkretsRef, KontekstEgenskaper, StemmekretsRef } from "types/api";
import {
  CustomOption,
  KontekstType,
  Krets,
  Tilhorighet,
  UseTilhorighet,
  mapGrunnkretsRefToKrets,
  mapStemmekretRefToKrets,
  sortKretserOptionsByNumber,
} from "./tilhorighetUtils";
import { useTilhorighetForm } from "./useTilhorighetForm";
import { isTempFeatureId } from "pages/Kart/interactions/tempFeatureIdUtil";
import { editSource } from "hooks/layers/constants";
import { Geometry } from "ol/geom";
import { GrenseType } from "hooks/layers/types";
import { isAdministrativGrense } from "utils/grenser";

const getAdministrativeFeatures = (features: Feature<Geometry>[]) => {
  return features.filter((feature) => {
    const properties = feature.getProperties() as FeatureProperties;
    const grenseType = properties.type as GrenseType;
    return isAdministrativGrense(grenseType);
  });
};

const filterKontekstEgenskaperOnType = (egenskaper: KontekstEgenskaper[], type: string) => {
  return egenskaper
    .filter((egenskap) => egenskap.type == type)
    .map((egenskap) => egenskap.id?.lokalid.value || "")
    .filter((egenskap, index, workingList) => workingList.indexOf(egenskap) === index)
    .filter((id) => id.length > 0 && id != CustomOption.NOT_CHOSEN);
};

const useGetMuligeKretserForNyAdministrativGrense = (
  kontekstType: KontekstType,
  grunnkretser: GrunnkretsRef[],
  stemmekretser: StemmekretsRef[],
) => {
  const administrativeFeatures = getAdministrativeFeatures(editSource.getFeatures());

  const kontekstEgenskaperForAdministrativeFeatures = administrativeFeatures.flatMap(
    (feature) => (feature.getProperties() as FeatureProperties).kontekstEgenskaper,
  );

  const grunnkretsEgenskapIDer = filterKontekstEgenskaperOnType(
    kontekstEgenskaperForAdministrativeFeatures,
    "GRUNNKRETS",
  );

  const stemmekretsEgenskapIDer = filterKontekstEgenskaperOnType(
    kontekstEgenskaperForAdministrativeFeatures,
    "STEMMEKRETS",
  );

  const { data: grunnkretserIfExists } = useGrunnkretser(grunnkretsEgenskapIDer);
  const { data: stemmekretserIfExists } = useStemmekretser(stemmekretsEgenskapIDer);

  return useMemo(() => {
    if (!grunnkretserIfExists && !stemmekretserIfExists) return null;
    const grunnkretserAsTilhorighetKrets = grunnkretserIfExists?.map((grunnkrets) => {
      return {
        id: grunnkrets.id,
        kommuneId: grunnkrets.kommuneIdentifikator,
        navn: grunnkrets.navn,
        nummer: grunnkrets.grunnkretsnummer,
        type: "GRUNNKRETS",
        version: grunnkrets.version,
      } as Krets;
    });

    const stemmekretserAsTilhorighetKrets = stemmekretserIfExists?.map((stemmekrets) => {
      return {
        id: stemmekrets.id,
        kommuneId: stemmekrets.kommuneIdentifikator,
        navn: stemmekrets.stemmekretsnavn,
        nummer: stemmekrets.stemmekretsnummer,
        type: "STEMMEKRETS",
        version: stemmekrets.version,
      } as Krets;
    });

    const fullGrunnkretser = mapGrunnkretsRefToKrets(grunnkretser).concat(
      sortKretserOptionsByNumber(grunnkretserAsTilhorighetKrets),
    );

    const fullStemmekretser = mapStemmekretRefToKrets(stemmekretser).concat(
      sortKretserOptionsByNumber(stemmekretserAsTilhorighetKrets),
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
  }, [grunnkretser, grunnkretserIfExists, kontekstType, stemmekretser, stemmekretserIfExists]);
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

  const { data: grunnkretserFromContext } = useKommuneGrunnkretserRef(kommunerId[0]);
  const { data: stemmekretserFromContext } = useKommuneStemmekretserRef(kommunerId[0]);

  const muligeKretserForNyGrense = useGetMuligeKretserForNyAdministrativGrense(
    kontekstType,
    grunnkretserFromContext ?? [],
    stemmekretserFromContext ?? [],
  );

  useEffect(() => {
    if (isTempFeatureId(feature.getId())) {
      if (grunnkretserFromContext && stemmekretserFromContext && kontekstType) {
        if (muligeKretserForNyGrense) {
          setTilhorighetOptions(muligeKretserForNyGrense);
        }
      }
      return;
    }
  }, [
    feature,
    grunnkretserFromContext,
    kontekstType,
    muligeKretserForNyGrense,
    setTilhorighetOptions,
    stemmekretserFromContext,
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

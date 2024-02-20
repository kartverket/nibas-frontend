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
  grunnkretsRefsFromContext: GrunnkretsRef[],
  stemmekretsRefsFromContext: StemmekretsRef[],
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
        nummer: grunnkrets.grunnkretsnummer,
        type: "GRUNNKRETS",
        version: grunnkrets.version,
      } as Krets;
    });

    const stemmekretserFraGrenseKontekstEgenskaper = stemmekretserIfExists?.map((stemmekrets) => {
      return {
        id: stemmekrets.id,
        kommuneId: stemmekrets.kommuneIdentifikator,
        navn: stemmekrets.stemmekretsnavn,
        nummer: stemmekrets.stemmekretsnummer,
        type: "STEMMEKRETS",
        version: stemmekrets.version,
      } as Krets;
    });

    const fullGrunnkretser = mapGrunnkretsRefToKrets(grunnkretsRefsFromContext).concat(
      sortKretserOptionsByNumber(grunnkretserFraGrenseKontekstegenskaper),
    );

    const fullStemmekretser = mapStemmekretRefToKrets(stemmekretsRefsFromContext).concat(
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
  }, [
    grunnkretsRefsFromContext,
    grunnkretserIfExists,
    kontekstType,
    stemmekretsRefsFromContext,
    stemmekretserIfExists,
  ]);
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
  const { data: grunnkretsRefsFromContext } = useKommuneGrunnkretserRef(kommunerId[0]);
  const { data: stemmekretRefsFromContext } = useKommuneStemmekretserRef(kommunerId[0]);

  const muligeKretserForNyGrense = useGetMuligeKretserForNyAdministrativGrense(
    kontekstType,
    grunnkretsRefsFromContext ?? [],
    stemmekretRefsFromContext ?? [],
  );

  useEffect(() => {
    if (isTempFeatureId(feature.getId())) {
      if (grunnkretsRefsFromContext && stemmekretRefsFromContext && kontekstType) {
        if (muligeKretserForNyGrense) {
          setTilhorighetOptions(muligeKretserForNyGrense);
        }
      }
      return;
    }
  }, [
    feature,
    grunnkretsRefsFromContext,
    kontekstType,
    muligeKretserForNyGrense,
    setTilhorighetOptions,
    stemmekretRefsFromContext,
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

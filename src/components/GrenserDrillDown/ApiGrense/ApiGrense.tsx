import { useEditGrenseValue } from "contexts/EditGrenserContext/EditGrenserContext";
import { EditingType } from "contexts/EditGrenserContext/types";
import { useEffect, useMemo } from "react";
import { GrenseResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import { getFeatureFromGeoJson } from "utils/map/geoJson";
import { getRepresentasjonspunktId } from "utils/map/source";
import ToggleableGrense from "../ToggleableGrense/ToggleableGrense";
import useApiGrense from "./useApiGrense";

type Props<T> = {
  grense: T;
  type: EditingType;
  featuresUrl: string;
};

const getGrenseResponseNummer = (grense: GrenseResponse) =>
  "fylkesnummer" in grense
    ? grense.fylkesnummer.kodeverdi
    : "kommunenummer" in grense
      ? grense.kommunenummer.kodeverdi
      : "0";

export const getRepresentasjonspunktFeatureForGrenseResponse = (grense: GrenseResponse) => {
  return getFeatureFromGeoJson({
    ...grense.representasjonspunkt,
    id: getRepresentasjonspunktId(grense.id.lokalid.value),
    properties: {
      ...grense.representasjonspunkt.properties,
      name: getNavnInSpraak(grense.navn, "nor"),
      number: getGrenseResponseNummer(grense),
    },
  });
};

const ApiGrense = <T extends GrenseResponse>({ grense, type, featuresUrl }: Props<T>) => {
  const grenseId = getIdFromEntity(grense);
  const { isEditing, isVisible } = useEditGrenseValue(type, grenseId);
  const { features, fetchFeatures } = useApiGrense(featuresUrl, isEditing || isVisible);

  useEffect(() => {
    features?.forEach((feature) => {
      feature.setProperties({
        ...feature.getProperties(),
        inndelingerKontekst: {
          id: grenseId,
          type,
        },
      });
    });
  }, [features, grenseId, type]);

  useEffect(() => {
    if (features || !isVisible) return;

    fetchFeatures();
  }, [isVisible, features, fetchFeatures]);

  const memoizedFeatures = useMemo(() => {
    if (!grense || !features) {
      return null;
    }

    const representasjonspunktFeatures = getRepresentasjonspunktFeatureForGrenseResponse(grense);

    return features.concat(representasjonspunktFeatures);
  }, [features, grense]);

  return (
    <ToggleableGrense
      key={grense.id.lokalid.value}
      grense={grense}
      type={type}
      title={`${getGrenseResponseNummer(grense)} ${getNavnInSpraak(grense.navn, "nor")}`}
      features={memoizedFeatures}
    />
  );
};

export default ApiGrense;

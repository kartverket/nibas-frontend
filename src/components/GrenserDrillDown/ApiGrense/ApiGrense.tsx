import { useEffect } from "react";
import ToggleableGrense from "../ToggleableGrense/ToggleableGrense";
import useApiGrense from "./useApiGrense";
import { EditingType } from "contexts/EditGrenserContext/types";
import { useEditGrenseValue } from "contexts/EditGrenserContext/EditGrenserContext";
import { FylkeRef, GrenseRef, KommuneRef } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { getIdFromEntity } from "utils/api";

type Props<T> = {
  grense: T;
  type: EditingType;
  featuresUrl: string;
};

const ApiGrense = <T extends GrenseRef>({ grense, type, featuresUrl }: Props<T>) => {
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

  const nummer =
    type === "fylke" ? (grense as FylkeRef).fylkesnummer.kodeverdi : (grense as KommuneRef).kommunenummer.kodeverdi;
  const navn = getNavnInSpraak(grense.navn, "nor");

  return <ToggleableGrense key={navn} grense={grense} type={type} title={`${nummer} ${navn}`} features={features} />;
};

export default ApiGrense;

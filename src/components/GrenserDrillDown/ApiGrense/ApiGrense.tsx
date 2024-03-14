import { useEditGrenseValue } from "contexts/EditGrenserContext/EditGrenserContext";
import { EditingType } from "contexts/EditGrenserContext/types";
import { useEffect } from "react";
import { FylkeResponse, GrenseRef, KommuneResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import ToggleableGrense from "../ToggleableGrense/ToggleableGrense";
import useApiGrense from "./useApiGrense";

type Props<T> = {
  grense: T;
  type: EditingType;
  featuresUrl: string;
};

const ApiGrense = <T extends GrenseRef>({ grense, type, featuresUrl }: Props<T>) => {
  const grenseId = getIdFromEntity(grense);
  const { editing, visible } = useEditGrenseValue(type, grenseId);
  const { features, fetchFeatures } = useApiGrense(featuresUrl, editing || visible);

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
    if (features || !visible) return;

    fetchFeatures();
  }, [visible, features, fetchFeatures]);

  const nummer =
    type === "fylke"
      ? (grense as FylkeResponse).fylkesnummer.kodeverdi
      : (grense as KommuneResponse).kommunenummer.kodeverdi;
  const navn = getNavnInSpraak(grense.administrativenhetnavn, "nor");

  return <ToggleableGrense key={navn} grense={grense} type={type} title={`${nummer} ${navn}`} features={features} />;
};

export default ApiGrense;

import { useEffect } from "react";
import ToggleableGrense from "../ToggleableGrense";
import useApiGrense from "./useApiGrense";
import { EditingType } from "contexts/EditGrenserContext";
import { useEditGrenseValue } from "contexts/EditGrenserContext/EditGrenserContext";
import { GrenseRef } from "types/api";
import { getNavnInSpraak } from "utils/language/language";

type Props<T> = {
  grense: T;
  type: EditingType;
  featuresUrl: string;
};

const ApiGrense = <T extends GrenseRef>({
  grense,
  type,
  featuresUrl,
}: Props<T>) => {
  const { editing, visible } = useEditGrenseValue(type, grense.id);
  const { features, fetchFeatures } = useApiGrense(
    featuresUrl,
    editing || visible
  );

  useEffect(() => {
    features?.forEach((feature) => {
      feature.setProperties({
        ...feature.getProperties(),
        inndelingerKontekst: {
          id: grense.id,
          type,
        },
      });
    });
  }, [features, grense.id, type]);

  useEffect(() => {
    if (features || !visible) return;

    fetchFeatures();
  }, [visible, features, fetchFeatures]);

  const navn = getNavnInSpraak(grense.navn, "nor");

  return (
    <ToggleableGrense
      key={navn}
      grense={grense}
      type={type}
      title={navn}
      features={features}
    />
  );
};

export default ApiGrense;

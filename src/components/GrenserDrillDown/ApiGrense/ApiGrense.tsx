import { useEffect } from "react";
import ToggleableGrense from "../ToggleableGrense";
import useApiGrense from "./useApiGrense";
import { EditingType, useEditGrenser } from "contexts/EditGrenserContext";
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
  const { values } = useEditGrenser(type);
  const grenseValue = values[grense.id];
  const { features, fetchFeatures } = useApiGrense(
    featuresUrl,
    grenseValue?.editing || grenseValue?.visible
  );

  useEffect(() => {
    if (features || !grenseValue?.visible) return;

    fetchFeatures();
  }, [grenseValue, features, fetchFeatures]);

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

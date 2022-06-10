import { useCallback, useEffect } from "react";
import ToggleableGrense from "../ToggleableGrense";
import useApiGrense from "./useApiGrense";
import { EditingType, ObjectValue } from "contexts/EditGrenserContext";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import { GrenseRef } from "types/api";
import { getNavnInSpraak } from "utils/language/language";

type Props<T> = {
  grense: T;
  grenseValue: ObjectValue;
  setGrenseValue: (grenseId: string, value: ObjectValue) => void;
  type: EditingType;
  featuresUrl: string;
};

const ApiGrense = <T extends GrenseRef>({
  grense,
  grenseValue,
  setGrenseValue,
  type,
  featuresUrl,
}: Props<T>) => {
  const { features, fetchFeatures } = useApiGrense(
    featuresUrl,
    grenseValue?.editing || grenseValue?.visible
  );
  const { value } = useEditGrense(type, grense.id, features);

  useEffect(() => {
    const { visible } = value;
    if (features || !visible) return;

    fetchFeatures();
  }, [value, features, fetchFeatures]);

  const navn = getNavnInSpraak(grense.navn, "nor");

  const fetchSetObjectValue = useCallback(
    (grenseId: string, newGrenseValue: ObjectValue) => {
      setGrenseValue(grenseId, newGrenseValue);

      // hvis features skal være synlig, hent features i tillegg
      if (!newGrenseValue?.visible && !newGrenseValue?.editing) return;

      if (!features) {
        fetchFeatures();
      }
    },
    [features, setGrenseValue, fetchFeatures]
  );

  return (
    <ToggleableGrense
      key={navn}
      grense={grense}
      type={type}
      title={navn}
      objectValue={grenseValue}
      setObjectValue={fetchSetObjectValue}
      features={features}
    />
  );
};

export default ApiGrense;

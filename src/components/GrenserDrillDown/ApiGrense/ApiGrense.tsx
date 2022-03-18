import { useCallback } from "react";
import ToggleableGrense from "../ToggleableGrense";
import { EditingType, ObjectValue } from "../useEditGrenser";
import useApiGrense from "./useApiGrense";
import { GrenseRef } from "types/api";

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
  const { features, fetchFeatures } = useApiGrense(featuresUrl);

  const navn = grense.navn.find((navn) => navn.spraak === "nor")?.navn ?? "";

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

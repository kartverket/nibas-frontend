import ToggleableGrense from "./ToggleableGrense";
import useApiGrense from "./useApiGrense";
import { EditingType, ObjectValue } from "./useEditGrenser";
import { SimpleGrense } from "types/api";

type Props<T> = {
  grense: T;
  grenseValue: ObjectValue;
  setGrenseValue: (grenseId: string, value: ObjectValue) => void;
  type: EditingType;
  featuresUrl: string;
};

const ApiGrense = <T extends SimpleGrense>({
  grense,
  grenseValue,
  setGrenseValue,
  type,
  featuresUrl,
}: Props<T>) => {
  const { features, fetchFeatures } = useApiGrense(featuresUrl);

  const navn = grense.navn.find((navn) => navn.spraak === "nor")?.navn ?? "";

  return (
    <ToggleableGrense
      key={navn}
      grense={grense}
      type={type}
      title={navn}
      objectValue={grenseValue}
      setObjectValue={setGrenseValue}
      features={features}
      fetchFeatures={fetchFeatures}
    />
  );
};

export default ApiGrense;

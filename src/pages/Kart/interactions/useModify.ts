import { useMemo } from "react";
import { Collection } from "ol";
import Modify from "ol/interaction/Modify";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";

const useModify = () => {
  const { selectedFeatures } = useFeatureStyle();

  const modify = useMemo(() => {
    return new Modify({
      features: new Collection(selectedFeatures),
    });
  }, [selectedFeatures]);

  return { modify };
};

export default useModify;

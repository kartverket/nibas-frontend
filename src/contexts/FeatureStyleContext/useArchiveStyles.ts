import { editSource } from "hooks/layers/constants";
import { useState } from "react";
import { grenseStyles } from "utils/map/layerStyles";

const useArchiveStyles = () => {
  const [archivedFeatureIds, setArchivedFeatureIds] = useState<string[]>([]);

  const setArchivedFeatures = (features: string[]) => {
    for (const featureId of features) {
      editSource.getFeatureById(featureId)?.setStyle(grenseStyles.archived);
    }
    for (const featureId of archivedFeatureIds) {
      editSource.getFeatureById(featureId)?.setStyle(grenseStyles.archived);
    }
    setArchivedFeatureIds(features);
  };

  return {
    archivedFeatureIds,
    setArchivedFeatures,
  };
};

export default useArchiveStyles;

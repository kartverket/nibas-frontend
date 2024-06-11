import { Feature } from "ol";
import { isFeatureToBeArchived, isFeatureMetadataEditable } from "utils/features";
import { editSource } from "hooks/layers/constants";

const useIsGrenseinformasjonPanelDisabled = (feature: Feature) => {
  const isMetadataEditable = isFeatureMetadataEditable(feature, isFeatureToBeArchived(feature));

  if (!isMetadataEditable) {
    return true;
  }

  const isFeatureInEditLayer = editSource.getFeatures().some((editFeature) => editFeature.getId() === feature.getId());

  return !isFeatureInEditLayer;
};

export default useIsGrenseinformasjonPanelDisabled;

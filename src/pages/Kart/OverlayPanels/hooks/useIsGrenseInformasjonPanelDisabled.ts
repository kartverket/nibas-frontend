import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { Feature } from "ol";
import { isFeatureMetadataEditable } from "utils/features";
import { editSource } from "hooks/layers/constants";

const useIsGrenseinformasjonPanelDisabled = (feature: Feature) => {
  const { featureIsArchived } = useFeatureStyle();

  const isMetadataEditable = isFeatureMetadataEditable(feature, featureIsArchived(feature));

  if (!isMetadataEditable) return true;

  const isFeatureInEditLayer = editSource.getFeatures().some((editFeature) => editFeature.getId() === feature.getId());

  return !isFeatureInEditLayer;
};

export default useIsGrenseinformasjonPanelDisabled;

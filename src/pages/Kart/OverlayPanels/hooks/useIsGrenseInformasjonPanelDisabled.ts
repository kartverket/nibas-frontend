import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { Feature } from "ol";
import { isFeatureMetadataEditable } from "utils/features";
import { getEditSource } from "utils/map/layers";

const useIsGrenseinformasjonPanelDisabled = (feature: Feature) => {
  const { featureIsArchived } = useFeatureStyle();

  const isMetadataEditable = isFeatureMetadataEditable(feature, featureIsArchived(feature));

  if (!isMetadataEditable) return true;

  const isFeatureInEditLayer =
    getEditSource()
      ?.getFeatures()
      .some((editFeature) => editFeature.getId() === feature.getId()) ?? false;

  return !isFeatureInEditLayer;
};

export default useIsGrenseinformasjonPanelDisabled;

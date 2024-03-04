import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { Feature } from "ol";
import { isFeatureMetadataEditable } from "utils/features";
import { editSource } from "hooks/layers/constants";

const useIsGrenseinformasjonPanelDisabled = (feature: Feature) => {
  const { featureIsArchived } = useFeatureStyle();

  const isMetadataEditable = isFeatureMetadataEditable(feature, featureIsArchived(feature));

  const isFeatureInEditLayer = editSource.getFeatures().some((editFeature) => editFeature.getId() === feature.getId());

  const canEdit = isMetadataEditable && isFeatureInEditLayer;

  return !canEdit;
};

export default useIsGrenseinformasjonPanelDisabled;

import { editableGrenseTypes } from "hooks/layers/types";
import { FeatureLike } from "ol/Feature";
import { isFeatureToBeArchived, isFeatureWithFutureChange } from "utils/features";
import { useMergeFeatures } from "./useMergeFeatures";

const isFeatureMetadataEditable = (feature: FeatureLike) =>
  isFeatureOfEditableGrensetype(feature) && !isFeatureToBeArchived(feature);
const isFeatureOfEditableGrensetype = (feature: FeatureLike) => editableGrenseTypes.includes(feature.get("type"));
export const isFeatureEditableStateless = (feature: FeatureLike) =>
  isFeatureOfEditableGrensetype(feature) &&
  !isFeatureToBeArchived(feature) &&
  isFeatureMetadataEditable(feature) &&
  !isFeatureWithFutureChange(feature);
export const useFeatureEditability = () => {
  const { featuresInSammenslaaing } = useMergeFeatures();

  const isFeaturePartOfSammenslaaing = (feature: FeatureLike) => {
    return featuresInSammenslaaing?.map((fis) => fis.getId()).includes(feature.getId()) ?? false;
  };

  const isFeatureEditable = (feature: FeatureLike) =>
    isFeatureEditableStateless(feature) && !isFeaturePartOfSammenslaaing(feature);

  return { isFeatureEditable, isFeatureMetadataEditable };
};

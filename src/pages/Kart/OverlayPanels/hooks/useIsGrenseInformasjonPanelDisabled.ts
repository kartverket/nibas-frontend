import { useEditGrenser } from "contexts/EditGrenserContext";
import { FeatureProperties } from "types/api";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { Feature } from "ol";
import { isFeatureEditable } from "utils/features";

const useIsGrenseinformasjonPanelDisabled = (feature: Feature, properties: FeatureProperties) => {
  const { featureIsArchived } = useFeatureStyle();
  const { kretsStatuser } = useEditGrenser(properties.inndelingerKontekst?.type ?? "fylke");

  const kretsStatus = kretsStatuser[feature.getId() ?? ""];

  const borderIsNotEditable = !isFeatureEditable(feature, featureIsArchived(feature));
  return ((kretsStatus?.visible && !kretsStatus?.editing) || borderIsNotEditable) ?? true;
};

export default useIsGrenseinformasjonPanelDisabled;

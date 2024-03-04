import { useEditGrenser } from "contexts/EditGrenserContext";
import { FeatureProperties } from "types/api";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { Feature } from "ol";
import { isFeatureMetadataEditable } from "utils/features";

const useIsGrenseinformasjonPanelDisabled = (feature: Feature, properties: FeatureProperties) => {
  const { featureIsArchived } = useFeatureStyle();

  const featureInndelingsKontekst = properties.inndelingerKontekst;
  const { kretsStatuser } = useEditGrenser(featureInndelingsKontekst.type);

  if (!kretsStatuser) return true;

  const kretsStatusTilFeature = kretsStatuser[featureInndelingsKontekst.id];

  const canEdit = isFeatureMetadataEditable(feature, featureIsArchived(feature)) && kretsStatusTilFeature.editing;

  return !canEdit;
};

export default useIsGrenseinformasjonPanelDisabled;

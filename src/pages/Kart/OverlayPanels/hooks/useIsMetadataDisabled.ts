import { useEditGrenser } from "contexts/EditGrenserContext";
import { FeatureProperties } from "types/api";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { Feature } from "ol";

const useIsMetadataDisabled = (feature: Feature, properties: FeatureProperties) => {
  const { featureIsEditable } = useFeatureStyle();
  const { kretsStatuser } = useEditGrenser(properties.inndelingerKontekst?.type ?? "fylke");

  const featureKontekstId = properties.inndelingerKontekst?.id;

  if (!featureKontekstId) return true;

  const value = kretsStatuser[featureKontekstId];

  const borderIsNotEditable = !featureIsEditable(feature);
  return ((value?.visible && !value?.editing) || borderIsNotEditable) ?? true;
};

export default useIsMetadataDisabled;

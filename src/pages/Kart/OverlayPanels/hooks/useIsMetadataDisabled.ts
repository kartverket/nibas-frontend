import { useEditGrenser } from "contexts/EditGrenserContext";
import { FeatureProperties } from "types/api";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { Feature } from "ol";

const useIsMetadataDisabled = (
  feature: Feature,
  properties: FeatureProperties,
) => {
  const { featureIsEditable } = useFeatureStyle();
  const { kretsStatuser } = useEditGrenser(
    properties.inndelingerKontekst?.type ?? "fylke",
  );

  // const featureKontekstId = properties.inndelingerKontekst?.id;

  // if (!featureKontekstId) return true;

  const kretsStatus = kretsStatuser[feature.getId() ?? ""];

  const borderIsNotEditable = !featureIsEditable(feature);
  return (
    ((kretsStatus?.visible && !kretsStatus?.editing) || borderIsNotEditable) ??
    true
  );
};

export default useIsMetadataDisabled;

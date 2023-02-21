import { useEditGrenser } from "contexts/EditGrenserContext";
import { FeatureProperties } from "types/api";
import { editableBorderTypes } from "hooks/layers/constants";

const useIsMetadataDisabled = (properties: FeatureProperties) => {
  const { values } = useEditGrenser(
    properties.inndelingerKontekst?.type ?? "fylke"
  );

  const featureKontekstId = properties.inndelingerKontekst?.id;

  if (!featureKontekstId) return true;

  const value = values[featureKontekstId];

  return (
    ((value?.visible && !value?.editing) ||
      !editableBorderTypes.includes(properties.type)) ??
    true
  );
};

export default useIsMetadataDisabled;

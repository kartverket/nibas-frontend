import { useEditGrenser } from "contexts/EditGrenserContext";
import { FeatureProperties } from "types/api";

export const editingTypeByKontekstType = {
  KOMMUNE: "kommune",
  FYLKE: "fylke",
  NASJON: "nasjon",
  GRUNNKRETS: "grunnkrets",
} as const;

const useIsMetadataDisabled = (properties: FeatureProperties) => {
  const { values } = useEditGrenser(
    properties.inndelingerKontekst?.type ?? "fylke"
  );

  const featureKontekstId = properties.inndelingerKontekst?.id;

  if (!featureKontekstId) return true;

  const value = values[featureKontekstId];

  return (value?.visible && !value?.editing) ?? false;
};

export default useIsMetadataDisabled;

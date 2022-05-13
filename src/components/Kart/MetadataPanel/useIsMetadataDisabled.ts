import { useEditGrenser } from "components/GrenserDrillDown/EditGrenserContext";
import { FeatureProperties } from "types/api";

export const editingTypeByKontekstType = {
  KOMMUNE: "kommune",
  FYLKE: "fylke",
  NASJON: "nasjon",
} as const;

const useIsMetadataDisabled = (properties: FeatureProperties) => {
  const { values } = useEditGrenser(
    editingTypeByKontekstType[properties.kontekstEgenskaper?.type ?? "FYLKE"]
  );

  const featureKontekstId = properties.kontekstEgenskaper?.id;

  if (!featureKontekstId) return true;

  const value = values[featureKontekstId];

  return value?.visible && !value?.editing;
};

export default useIsMetadataDisabled;

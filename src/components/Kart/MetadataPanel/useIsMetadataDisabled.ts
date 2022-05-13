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

  return featureKontekstId
    ? values[featureKontekstId]?.visible && !values[featureKontekstId]?.editing
    : true;
};

export default useIsMetadataDisabled;

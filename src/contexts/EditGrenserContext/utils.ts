import { EditingType } from "./types";
import { GrenseId } from "hooks/layers/types";
import { FeatureProperties } from "types/api";
import { getLayerById } from "utils/map/layers";
import { mapFeatureToFeatureId } from "utils/map/source";

export const getFeaturesIdsByInndelingerKontekst = (
  layerId: GrenseId,
  editingType: EditingType,
  id: string
) =>
  getLayerById(layerId)
    .getSource()
    .getFeatures()
    .filter((feature) => {
      const { type, id: kontekstId } = (
        feature.getProperties() as FeatureProperties
      ).inndelingerKontekst;

      return type === editingType && kontekstId === id;
    })
    .map(mapFeatureToFeatureId);

import { MapBrowserEvent } from "ol";
import Feature, { FeatureLike } from "ol/Feature";
import { LineString } from "ol/geom";
import { map } from "../constants";
import { pixelTolerance } from "./constants";
import { getLayerById } from "utils/map/layers";
import { LayerId } from "hooks/layers/types";
import { isLineStringFeature } from "utils/type-utils";

export const useGetFeatures = () => {
  const getFeaturesAtPixel = (event: MapBrowserEvent<MouseEvent>, layerIdToFilter: LayerId | null): FeatureLike[] =>
    map.getFeaturesAtPixel(event.pixel, {
      layerFilter: (layer) => (layerIdToFilter ? layer === getLayerById(layerIdToFilter) : true),
      hitTolerance: pixelTolerance,
    });

  const getActiveFeaturesAtPixel = (
    event: MapBrowserEvent<MouseEvent>,
    layerIdToFilter: LayerId | null,
  ): Feature<LineString>[] => getFeaturesAtPixel(event, layerIdToFilter).filter(isLineStringFeature);

  return { getActiveFeaturesAtPixel, getFeaturesAtPixel };
};

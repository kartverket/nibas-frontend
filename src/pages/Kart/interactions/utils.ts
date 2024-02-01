import { MapBrowserEvent } from "ol";
import { FeatureLike } from "ol/Feature";
import { LineString } from "ol/geom";
import { map } from "../constants";
import { pixelTolerance } from "./constants";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { getLayerById } from "utils/map/layers";
import { LayerId } from "hooks/layers/types";
import { Coordinate } from "ol/coordinate";

export const useGetFeatures = () => {
  const { featureIsArchived } = useFeatureStyle();

  const getFeaturesAtPixel = (event: MapBrowserEvent<MouseEvent>, layerIdToFilter: LayerId | null): FeatureLike[] =>
    map.getFeaturesAtPixel(event.pixel, {
      layerFilter: (layer) => (layerIdToFilter ? layer === getLayerById(layerIdToFilter) : true),
      hitTolerance: pixelTolerance,
    });

  const getActiveFeaturesAtPixel = (
    event: MapBrowserEvent<MouseEvent>,
    layerIdToFilter: LayerId | null,
  ): FeatureLike[] => {
    return getFeaturesAtPixel(event, layerIdToFilter)
      .filter((feature) => feature.getGeometry() instanceof LineString)
      .filter((feature) => !featureIsArchived(feature));
  };

  const coordinatesAreEqual = (a: Coordinate, b: Coordinate): boolean => {
    if (a && b) {
      return a.toString() === b.toString();
    }

    return false;
  };

  return { getActiveFeaturesAtPixel, getFeaturesAtPixel, coordinatesAreEqual };
};

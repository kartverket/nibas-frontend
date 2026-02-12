import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { initialMapCenter, initialMapZoom, map } from "pages/Kart/constants";
import { SidePanelWidth } from "pages/Kart/OverlayPanels/Panel";

export const resetMapView = () => {
  const view = map.getView();

  view.animate({
    zoom: initialMapZoom,
    center: initialMapCenter,
    duration: 500,
  });
};

const calculateFeaturesExtent = (features: Feature<Geometry>[]) => {
  const extent = features.reduce<number[] | null>((acc, feature) => {
    const featureExtent = feature.getGeometry()?.getExtent();

    if (!featureExtent) {
      return acc;
    }

    if (!acc) {
      return [featureExtent[0], featureExtent[1], featureExtent[2], featureExtent[3]];
    }

    return [
      Math.min(acc[0], featureExtent[0]),
      Math.min(acc[1], featureExtent[1]),
      Math.max(acc[2], featureExtent[2]),
      Math.max(acc[3], featureExtent[3]),
    ];
  }, null);

  return extent;
};

type useMapReturnValues = {
  zoomToFeatures: (features: Feature<Geometry>[], options?: { ignoreSidePanel?: boolean; padding?: number[] }) => void;
};

export const useMap = (): useMapReturnValues => {
  const { activeOverlayPanel } = useOverlayPanel();

  const zoomToFeatures = (
    features: Feature<Geometry>[],
    options?: { ignoreSidePanel?: boolean; padding?: number[] },
  ): void => {
    const { ignoreSidePanel = false, padding = [100, 100, 200, 100] } = options ?? {};
    if (features.length === 0) {
      resetMapView();
    }
    const extent = calculateFeaturesExtent(features);

    if (!extent) {
      return;
    }

    const view = map.getView();
    if (activeOverlayPanel != null && !ignoreSidePanel) {
      const sidePanelPadding = [...padding];
      sidePanelPadding[1] = sidePanelPadding[1] + SidePanelWidth;
      view.fit(extent, {
        padding: sidePanelPadding,
        duration: 750,
      });
    } else {
      view.fit(extent, {
        padding: padding,
        duration: 750,
      });
    }
  };

  return {
    zoomToFeatures,
  };
};

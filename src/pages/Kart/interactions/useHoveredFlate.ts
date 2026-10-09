import { Feature, MapBrowserEvent } from "ol";
import { useState } from "react";
import { MultiPolygon } from "ol/geom";
import { isMultiPolygonFeature } from "utils/type-utils";
import { useGetFeatures } from "./interaction-utils";
import useHoveredFeature from "./useHoveredFeature";

const useHoveredFlate = (enabled: boolean, shouldClearHover?: boolean) => {
  const { getFeaturesAtPixel } = useGetFeatures();

  const [hoveredFlate, setHoveredFlate] = useState<Feature<MultiPolygon> | null>(null);

  const setHoverState = (flate: Feature<MultiPolygon> | null) => {
    setHoveredFlate(flate);
  };

  const handleClearHoverState = () => {
    if (shouldClearHover === true) {
      setHoverState(null);
    }
  };

  const onPointerMove = (e: MapBrowserEvent<PointerEvent>) => {
    const features = getFeaturesAtPixel(e as MapBrowserEvent<PointerEvent>, null);
    // Vi velger første feature. Hvis det er flere må man zoome inn for å treffe den man tenker på.
    const feature = features[0];
    if (feature != null) {
      if (isMultiPolygonFeature(feature)) {
        const flate = feature.getGeometry();
        if (flate != null) {
          setHoverState(feature);
        }
      }
    } else {
      handleClearHoverState();
    }
  };

  useHoveredFeature(enabled, onPointerMove, handleClearHoverState);

  return { hoveredFlate };
};

export default useHoveredFlate;

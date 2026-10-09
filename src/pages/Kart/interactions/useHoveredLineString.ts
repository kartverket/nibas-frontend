import { Feature, MapBrowserEvent } from "ol";
import { Coordinate } from "ol/coordinate";
import { LineString } from "ol/geom";
import { useState } from "react";
import { findNearbyVertexOnFeature } from "utils/map/map-utils";
import { isLineStringFeature } from "utils/type-utils";
import { useGetFeatures } from "./interaction-utils";
import useHoveredFeature from "./useHoveredFeature";

const useHoveredLineString = (enabled: boolean, shouldClearHover?: boolean) => {
  const { getFeaturesAtPixel } = useGetFeatures();

  const [hoveredVertex, setHoveredVertex] = useState<Coordinate | undefined>();
  const [hoveredLineString, setHoveredLineString] = useState<Feature<LineString> | null>(null);

  const setHoverState = (linestring: Feature<LineString> | null, vertex?: Coordinate) => {
    setHoveredLineString(linestring);
    setHoveredVertex(vertex);
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
      if (isLineStringFeature(feature)) {
        const lineString = feature.getGeometry();
        if (lineString != null) {
          const vertex = findNearbyVertexOnFeature(lineString, e.coordinate);
          if (vertex != null) {
            setHoverState(feature, vertex);
          } else {
            setHoverState(feature);
          }
        }
      }
    } else {
      handleClearHoverState();
    }
  };

  useHoveredFeature(enabled, onPointerMove, handleClearHoverState);

  return { hoveredLineString, hoveredVertex };
};

export default useHoveredLineString;

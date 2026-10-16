import { Coordinate } from "ol/coordinate";
import { useMemo } from "react";
import { findNearbyVertexOnFeature } from "utils/map/map-utils";
import { isLineStringFeature } from "utils/type-utils";
import useHoveredFeature from "./useHoveredFeature";

const useHoveredLineString = (enabled: boolean, shouldClearHover?: boolean) => {
  const { hoveredFeature: hoveredLineString, hoveredCoordinate } = useHoveredFeature(
    enabled,
    shouldClearHover,
    isLineStringFeature,
    16,
  );
  const hoveredVertex = useMemo<Coordinate | undefined>(() => {
    const lineString = hoveredLineString?.getGeometry();
    return lineString != null && hoveredCoordinate != null
      ? (findNearbyVertexOnFeature(lineString, hoveredCoordinate) ?? undefined)
      : undefined;
  }, [hoveredCoordinate, hoveredLineString]);

  return { hoveredLineString, hoveredVertex };
};

export default useHoveredLineString;

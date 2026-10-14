import { isMultiPolygonFeature } from "utils/type-utils";
import useHoveredFeature from "./useHoveredFeature";

const useHoveredFlate = (enabled: boolean, shouldClearHover?: boolean) => {
  const { hoveredFeature: hoveredFlate } = useHoveredFeature(enabled, shouldClearHover, isMultiPolygonFeature);

  return { hoveredFlate };
};

export default useHoveredFlate;

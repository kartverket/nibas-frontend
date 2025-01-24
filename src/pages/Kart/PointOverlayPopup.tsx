import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { map, overlayPopup } from "./constants";
import useHoveredLineString from "./interactions/useHoveredLineString";
import { useToolbar } from "contexts/ToolbarContext";
import { useSelectStyles } from "contexts/FeatureStyleContext/useSelectStyles";
import { hoveredPointStyle } from "utils/map/layerStyles";
import { formatCoordinatesNor } from "./Kartinformasjon";

const PointOverlayPopup = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { activeTool } = useToolbar();
  const { hoveredVertex } = useHoveredLineString(activeTool === "grensecoordinates");
  const { selectPointOnFeature, clearSelectedPoint } = useSelectStyles();

  useEffect(() => {
    if (overlayRef.current && hoveredVertex) {
      selectPointOnFeature(hoveredVertex, hoveredPointStyle);
      overlayPopup.setElement(overlayRef.current);
      overlayPopup.setPosition(hoveredVertex);
      map.addOverlay(overlayPopup);
    }
    return () => {
      clearSelectedPoint();
      map.removeOverlay(overlayPopup);
    };
  }, [activeTool, clearSelectedPoint, hoveredVertex, selectPointOnFeature]);

  return (
    <Popup visible={hoveredVertex != null} ref={overlayRef}>
      {formatCoordinatesNor(hoveredVertex)}
    </Popup>
  );
};

const Popup = styled.div<{
  visible: boolean;
}>`
  color: white;
  background-color: var(--kvib-colors-gray-700);
  padding: 8px;
  border-radius: 4px;
  display: ${({ visible }) => (visible ? "block" : "none")};
`;

export default PointOverlayPopup;

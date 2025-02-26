import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { map } from "./constants";
import useHoveredLineString from "./interactions/useHoveredLineString";
import { useToolbar } from "contexts/ToolbarContext";
import { useSelectStyles } from "contexts/FeatureStyleContext/useSelectStyles";
import { hoveredPointStyle } from "utils/map/layerStyles";
import { formatCoordinatesNor } from "./Kartinformasjon";
import Overlay from "ol/Overlay";

export const overlayPopup = new Overlay({
  autoPan: {
    animation: {
      duration: 250,
    },
  },
  positioning: "center-center",
  offset: [0, -35],
});

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
    <Popup $visible={hoveredVertex != null} ref={overlayRef}>
      {formatCoordinatesNor(hoveredVertex)}
    </Popup>
  );
};

export default PointOverlayPopup;

const Popup = styled.div<{
  $visible: boolean;
}>`
  color: white;
  background-color: var(--kvib-colors-gray-700);
  padding: 8px;
  border-radius: 4px;
  display: ${({ $visible }) => ($visible ? "block" : "none")};
`;

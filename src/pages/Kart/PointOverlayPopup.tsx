import { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { map } from "./constants";
import useHoveredLineString from "./interactions/useHoveredLineString";
import { useToolbar } from "contexts/ToolbarContext";
import { useSelectStyles } from "contexts/FeatureStyleContext/useSelectStyles";
import { hoveredPointStyle } from "utils/map/layerStyles";
import { formatCoordinatesNor } from "./Kartinformasjon";
import Overlay from "ol/Overlay";
import { IconButton, Text } from "@kvib/react";

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
  const [isHoveringPopup, setIsHoveringPopup] = useState(false);
  const { hoveredVertex } = useHoveredLineString(
    activeTool === "grensecoordinates" && !isHoveringPopup,
    !isHoveringPopup,
  );
  const { selectPointOnFeature, clearSelectedPoint } = useSelectStyles();

  useEffect(() => {
    if (overlayRef.current && hoveredVertex) {
      selectPointOnFeature(hoveredVertex, hoveredPointStyle);
      overlayPopup.setElement(overlayRef.current);
      overlayPopup.setPosition(hoveredVertex);
      overlayPopup.setOffset([0, -40]);
      map.addOverlay(overlayPopup);
    }
    return () => {
      clearSelectedPoint();
      map.removeOverlay(overlayPopup);
    };
  }, [activeTool, clearSelectedPoint, hoveredVertex, selectPointOnFeature]);

  return (
    <Popup
      $visible={hoveredVertex != null}
      ref={overlayRef}
      onMouseEnter={() => setIsHoveringPopup(true)}
      onMouseLeave={() => setIsHoveringPopup(false)}
    >
      <Text>{formatCoordinatesNor(hoveredVertex)}</Text>
      <IconButton
        variant="ghost"
        icon={"content_copy"}
        aria-label="Kopier koordinater"
        onClick={() => {
          navigator.clipboard.writeText(formatCoordinatesNor(hoveredVertex));
        }}
      />
    </Popup>
  );
};

export default PointOverlayPopup;

const Popup = styled.div<{
  $visible: boolean;
}>`
  background-color: var(--kvib-colors-white);
  box-shadow: var(--kvib-shadows-md);
  padding: 8px;
  border-radius: 4px;
  display: ${({ $visible }) => ($visible ? "flex" : "none")};
  align-items: center;
  gap: 8px;
`;

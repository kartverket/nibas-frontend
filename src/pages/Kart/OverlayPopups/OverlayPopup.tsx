import Overlay from "ol/Overlay";
import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { map } from "../constants";
import { useOverlayPopup } from "../../../contexts/OverlayPopupContext";

export const overlayPopup = new Overlay({
  autoPan: {
    animation: {
      duration: 250,
    },
  },
  positioning: "center-center",
  offset: [-150, 0],
});

export const OverlayPopup = () => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const { overlayPopupContent, overlayPopupPosition } = useOverlayPopup();

  useEffect(() => {
    if (overlayRef.current) {
      overlayPopup.setElement(overlayRef.current);
      overlayPopup.setPosition(overlayPopupPosition);
      map.addOverlay(overlayPopup);
    }

    return () => {
      map.removeOverlay(overlayPopup);
      overlayPopup.setElement(undefined);
      overlayPopup.setPosition(undefined);
    };
  }, [overlayPopupPosition]);

  return (
    <Popup $visible={true} ref={overlayRef}>
      {overlayPopupContent}
    </Popup>
  );
};

const Popup = styled.div<{
  $visible: boolean;
}>`
  display: ${({ $visible }) => ($visible ? "block" : "none")};
`;

import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { map } from "../constants";
import { useOverlayPopup } from "../../../contexts/OverlayPopupContext";

export const OverlayPopup = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { overlayPopup, overlayPopupContent, overlayPopupPosition } = useOverlayPopup();

  useEffect(() => {
    if (overlayRef.current) {
      overlayPopup.setElement(overlayRef.current);
      overlayPopup.setPosition(overlayPopupPosition);
      overlayPopup.setOffset([-150, 0]);
      map.addOverlay(overlayPopup);
    }

    return () => {
      map.removeOverlay(overlayPopup);
      overlayPopup.setElement(undefined);
      overlayPopup.setPosition(undefined);
      overlayPopup.setOffset([0, 0]);
    };
  }, [overlayPopup, overlayPopupPosition]);

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

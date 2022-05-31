import { forwardRef, useEffect, useRef } from "react";
import styled from "styled-components";
import { map, overlayPopup } from "./constants";

const OverlayPopup = forwardRef<HTMLDivElement>(function OverlayPopup() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    overlayPopup.setElement(overlayRef.current);

    map.addOverlay(overlayPopup);

    return () => {
      map.removeOverlay(overlayPopup);
    };
  }, []);

  return (
    <OlOverlay ref={overlayRef}>
      <p>AAA</p>
    </OlOverlay>
  );
});

const OlOverlay = styled.div`
  position: absolute;
  background-color: white;
`;

export default OverlayPopup;

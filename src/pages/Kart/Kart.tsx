import { Suspense, useEffect, useRef } from "react";
import { styled } from "styled-components";
import { map } from "./constants";
import OverlayPopup from "./OverlayPopup";
import SidebarPanels from "./SidebarPanels";
import useInteractions from "./interactions/useInteractions";
import Toolbar from "./Toolbar/Toolbar";
import OverlayPanels from "./OverlayPanels/OverlayPanels";
import { TegnforklaringButton } from "./OverlayPanels/Tegnforklaring/TegnforklaringButton";
import Kartinformasjon from "./Kartinformasjon";
import { zindex } from "utils/constants";

const Kart = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  // Legger til interactions (modify, select, osv) på kartet
  useInteractions();

  useEffect(() => {
    // mapRef kan egentlig ikke være null her,
    // MapTarget blir rendret før denne useEffect'en blir kjørt
    if (!mapRef.current) return;

    map.setTarget(mapRef.current);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return (
    <KartWrapper>
      <KartTarget ref={mapRef}>
        <Suspense fallback="More loading...">
          <KartOverlay>
            <Kartinformasjon />
            <TegnforklaringButton />
            <SidebarPanels />
            <OverlayPanels />
            <Toolbar />
          </KartOverlay>
          <OverlayPopup />
        </Suspense>
      </KartTarget>
    </KartWrapper>
  );
};

const KartWrapper = styled.div`
  grid-area: map;
  position: relative;
  width: 100%;
  height: 100%;
  border-right-width: 0;
  border-bottom-width: 0;
`;

const KartTarget = styled.div`
  width: 100%;
  height: 100%;

  .ol-control {
    text-align: center;
  }
  /* dragzoom kan kun få style via vanlig css tydeligvis */
  .ol-dragzoom {
    background: var(--kvib-colors-blue-200);
    opacity: 0.25;
    border-radius: 6px;
    border: solid 2px var(--kvib-colors-blue-700);
  }
`;

const KartOverlay = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 1fr auto;
  justify-items: center;
  grid-template-areas:
    "sidebar overlay sidepanel"
    "sidebar toolbar sidepanel";
  gap: 16px;
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: ${zindex.mapOverlay};
  overflow: hidden;
  pointer-events: none;

  & > * {
    pointer-events: all;
  }
`;

export default Kart;

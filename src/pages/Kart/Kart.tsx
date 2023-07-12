import { Suspense, useEffect, useRef } from "react";
import styled from "styled-components";
import { map } from "./constants";
import OverlayPopup from "./OverlayPopup";
import SidebarPanels from "./SidebarPanels";
import useInteractions from "./interactions/useInteractions";
import { initBakgrunnskartLayers, initGrenserLayers } from "utils/map/layers";
import Toolbar from "./Toolbar/Toolbar";
import OverlayPanels from "./OverlayPanels/OverlayPanels";
import { TegnforklaringButton } from "./OverlayPanels/Tegnforklaring/TegnforklaringButton";

// dette må skje utenfor komponenten siden React kjører dypere useEffects
// før de lenger opp i treet, så lag er ikke definert når de trengs lenger ned
initGrenserLayers();
initBakgrunnskartLayers();

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
  border: 3px solid var(--kvib-colors-gray-50);
  height: calc(100% - 6px);
  width: calc(100% - 6px);
  border-right-width: 0;
  border-bottom-width: 0;
`;

const KartTarget = styled.div`
  width: 100%;
  height: 100%;

  .ol-control {
    text-align: center;
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
  z-index: 1;
  overflow: hidden;
  pointer-events: none;

  & > * {
    pointer-events: all;
  }
`;

export default Kart;

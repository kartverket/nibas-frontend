import { Suspense, useEffect, useRef } from "react";
import styled from "styled-components";
import { map } from "./constants";
import OverlayPopup from "./OverlayPopup";
import SidebarPanels from "./SidebarPanels";
import useInteractions from "hooks/interactions/useInteractions";
import { initBakgrunnskartLayers, initGrenserLayers } from "utils/map/layers";
import Toolbar from "./Toolbar/Toolbar";
import OverlayPanels from "./OverlayPanels/OverlayPanels";

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
  border: 3px solid var(--gray_light);
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

// TODO: denne må kanskje skrives litt om, usikker på hva som er best
// bør nok ha en slags relativ posisjonering internt i denne
// vi vil vel at kartet skal faktisk bli mindre når man har en sidebar, men da må vel KartTarget være inne i denne?
// krever bare litt hjernekraft.

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

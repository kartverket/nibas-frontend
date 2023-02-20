import { Suspense, useEffect, useRef } from "react";
import styled from "styled-components";
import { map } from "./constants";
import OverlayPanels from "./OverlayPanels";
import OverlayPopup from "./OverlayPopup";
import SidebarPanels from "./SidebarPanels";
import { PanelType, useOverlayPanels } from "contexts/OverlayPanelsContext";
import useEditInteractions from "hooks/interactions/useEditInteractions";
import useSelectInteraction from "hooks/interactions/useSelectInteraction";
import { initBakgrunnskartLayers, initGrenserLayers } from "utils/map/layers";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";
import Toolbar from "./Toolbar/Toolbar";

// dette må skje utenfor komponenten siden React kjører dypere useEffects
// før de lenger opp i treet, så lag er ikke definert når de trengs lenger ned
initGrenserLayers();
initBakgrunnskartLayers();

const Kart = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { panelContext } = useOverlayPanels();
  const { redigeringsmodusAktiv } = useRedigeringsmodus();

  useEditInteractions();
  const { selectedFeatures } = useSelectInteraction();

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
          <KartOverlay content={panelContext?.type}>
            <SidebarPanels />
            <OverlayPanels />
            <UtkastBorder utkastActive={redigeringsmodusAktiv} />
            <Toolbar />
          </KartOverlay>
          <OverlayPopup selectedFeatures={selectedFeatures} />
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

const UtkastBorder = styled.div<{ utkastActive: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  pointer-events: none;
`;

const KartTarget = styled.div`
  width: 100%;
  height: 100%;

  .ol-control {
    text-align: center;
  }
`;

const KartOverlay = styled.div<{
  content?: PanelType;
}>`
  display: grid;

  grid-template-columns: 440px auto 120px;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "panel . toolbar"
    "panel metadata toolbar"
    "panel kretser toolbar";
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
  z-index: 1;
`;

export default Kart;

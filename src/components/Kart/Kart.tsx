import { Suspense, useEffect, useRef } from "react";
import styled, { css } from "styled-components";
import { map } from "./constants";
import ZoomControls from "./controls/ZoomControls";
import MetadataPanel from "./MetadataPanel";
import { MetadataPanelWrapper } from "./MetadataPanel/MetadataPanel";
import OverlayPopup from "./OverlayPopup";
import SidebarPanels from "./SidebarPanels";
import Toolbar from "./Toolbar";
import { PanelContent, useMetadataPanel } from "contexts/MetadataPanelContext";
import useEditInteractions from "hooks/interactions/useEditInteractions";
import useSelectInteraction from "hooks/interactions/useSelectInteraction";
import { initBakgrunnskartLayers, initGrenserLayers } from "utils/map/layers";

// dette må skje utenfor komponenten siden React kjører dypere useEffects
// før de lenger opp i treet, så lag er ikke definert når de trengs lenger ned
initGrenserLayers();
initBakgrunnskartLayers();

const Kart = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { panelContext } = useMetadataPanel();

  const selectedFeatures = useSelectInteraction();
  useEditInteractions();

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
          <KartOverlay content={panelContext?.content}>
            <SidebarPanels />
            <MetadataPanel />
            <Toolbar />
          </KartOverlay>

          <ZoomControls />
          <OverlayPopup selectedFeatures={selectedFeatures} />
        </Suspense>
      </KartTarget>
    </KartWrapper>
  );
};

const KartWrapper = styled.div`
  grid-area: map;
  position: relative;
  margin-left: -2px;
`;

const KartTarget = styled.div`
  width: 100%;
  height: 100%;

  .ol-control {
    text-align: center;
  }
`;

const KartOverlay = styled.div<{
  content?: PanelContent;
}>`
  display: grid;

  grid-template-columns: auto auto 1fr;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "panel toolbar ."
    "panel metadata metadata";
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
  z-index: 1;

  /* Flytt grensemetadata til høyre side på stor skjerm */
  ${({ content }) => {
    if (content === "grensemetadata")
      return css`
        @media (min-width: ${({ theme }) => theme.dimensions.lgPx}) {
          grid-template-columns: auto auto 1fr auto;
          grid-template-areas: "panel toolbar . metadata";
          grid-template-rows: 100%;
        }

        ${MetadataPanelWrapper} {
          @media (min-width: ${({ theme }) => theme.dimensions.lgPx}) {
            height: auto;
            max-height: 800px;
            width: 600px;
          }
        }
      `;
  }}
`;

export default Kart;

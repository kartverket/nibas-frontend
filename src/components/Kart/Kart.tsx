import { Suspense, useEffect, useRef } from "react";
import styled, { css } from "styled-components";
import { map } from "./constants";
import ZoomControls from "./controls/ZoomControls";
import OverlayPanels from "./OverlayPanels";
import { OverlayPanelWrapper } from "./OverlayPanels/OverlayPanels";
import OverlayPopup from "./OverlayPopup";
import SidebarPanels from "./SidebarPanels";
import Toolbar from "./Toolbar";
import UtkastTab from "./UtkastTab";
import { PanelType, userOverlayPanels } from "contexts/OverlayPanelsContext";
import useEditInteractions from "hooks/interactions/useEditInteractions";
import useSelectInteraction from "hooks/interactions/useSelectInteraction";
import { initBakgrunnskartLayers, initGrenserLayers } from "utils/map/layers";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";

// dette må skje utenfor komponenten siden React kjører dypere useEffects
// før de lenger opp i treet, så lag er ikke definert når de trengs lenger ned
initGrenserLayers();
initBakgrunnskartLayers();

const Kart = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { panelContext } = userOverlayPanels();
  const { redigeringsmodusAktiv } = useRedigeringsmodus();

  useEditInteractions();
  const selectedFeatures = useSelectInteraction();

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
          <UtkastTab />
          <KartOverlay content={panelContext?.type}>
            <SidebarPanels />
            <OverlayPanels />
            <Toolbar />
            <UtkastBorder utkastActive={redigeringsmodusAktiv} />
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
  margin-left: -5px;
`;

const UtkastBorder = styled.div<{ utkastActive: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  pointer-events: none;

  ${({ utkastActive }) =>
    utkastActive &&
    css`
      border: 3px solid ${({ theme }) => theme.colors.redDark};
      border-left-color: transparent;
    `}
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

  grid-template-columns: auto auto 1fr;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "panel toolbar ."
    "panel metadata metadata"
    "panel kretser kretser";
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;

  /* Flytt grensemetadata til høyre side på stor skjerm */
  /* ${({ content }) => {
    if (content === "grensemetadata")
      return css`
        @media (min-width: ${({ theme }) => theme.dimensions.lgPx}) {
          grid-template-columns: auto auto 1fr auto;
          grid-template-areas: "panel toolbar . metadata";
          grid-template-rows: 100%;
        }

        ${OverlayPanelWrapper} {
          @media (min-width: ${({ theme }) => theme.dimensions.lgPx}) {
            height: fit-content;
            max-height: 900px;
            width: 600px;
          }
        }
      `;
  }} */
`;

export default Kart;

import { Suspense, useEffect, useRef } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import styled from "styled-components";
import { map, overlayPopup } from "./constants";
import ZoomControls from "./controls/ZoomControls";
import MetadataPanel from "./MetadataPanel";
import SidebarPanels from "./SidebarPanels";
import { updateGrenser } from "api/grenser";
import CustomControl from "components/CustomControl";
import useEditInteractions from "hooks/interactions/useEditInteractions";
import useSelectInteraction from "hooks/interactions/useSelectInteraction";
import {
  getLayerById,
  initBakgrunnskartLayers,
  initGrenserLayers,
} from "utils/map/layers";

// dette må skje utenfor komponenten siden React kjører dypere useEffects
// før de lenger opp i treet, så lag er ikke definert når de trengs lenger ned
initGrenserLayers();
initBakgrunnskartLayers();

const Kart = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { tokenHolderFunc } = useAuthenticationFlow();

  useEditInteractions();
  useSelectInteraction();

  useEffect(() => {
    if (!overlayRef.current) return;

    overlayPopup.setElement(overlayRef.current);

    map.addOverlay(overlayPopup);

    return () => {
      map.removeOverlay(overlayPopup);
    };
  }, []);

  useEffect(() => {
    // mapRef kan egentlig ikke være null her,
    // MapTarget blir rendret før denne useEffect'en blir kjørt
    if (!mapRef.current) return;

    map.setTarget(mapRef.current);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  const saveDraft = async () => {
    const editLayer = getLayerById("edit");
    const editFeatures = editLayer.getSource().getFeatures();

    updateGrenser(editFeatures, tokenHolderFunc()?.token);
  };

  return (
    <KartWrapper>
      <KartTarget ref={mapRef}>
        <Suspense fallback="More loading...">
          <KartOverlay>
            <SidebarPanels />
            <MetadataPanel />
          </KartOverlay>

          <CustomControl>
            <button onClick={saveDraft}>Lagre endringer</button>
          </CustomControl>

          <ZoomControls />
        </Suspense>
      </KartTarget>
      <OlOverlay ref={overlayRef}>
        <p>AAA</p>
      </OlOverlay>
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

const KartOverlay = styled.div`
  display: grid;

  @media (min-width: ${({ theme }) => theme.dimensions.lgPx}) {
    grid-template-columns: 1fr auto;
    grid-template-areas: "panel metadata";
  }

  grid-template-rows: 3fr auto;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    "panel ."
    "panel metadata";
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
  z-index: 1;
`;

const OlOverlay = styled.div`
  position: absolute;
  background-color: white;
`;

export default Kart;

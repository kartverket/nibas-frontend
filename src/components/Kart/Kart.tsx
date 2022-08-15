import { Suspense, useEffect, useRef } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import styled from "styled-components";
import { map } from "./constants";
import ZoomControls from "./controls/ZoomControls";
import MetadataPanel from "./MetadataPanel";
import OverlayPopup from "./OverlayPopup";
import SidebarPanels from "./SidebarPanels";
import Toolbar from "./Toolbar";
import { updateGrenser } from "api/grenser";
import CustomControl from "components/CustomControl";
import Button from "components/form/Button";
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
  const { tokenHolderFunc } = useAuthenticationFlow();

  const { dirtyFeatureIds, clearHistory, undo, redo, canRedo } =
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

  const saveDraft = async () => {
    const editLayer = getLayerById("edit");
    const editFeatures = editLayer.getSource().getFeatures();
    const editedFeatures = editFeatures.filter((feature) =>
      dirtyFeatureIds.includes((feature.getId() as string) ?? "")
    );

    await updateGrenser(editedFeatures, tokenHolderFunc()?.token);
    clearHistory();
  };

  return (
    <KartWrapper>
      <KartTarget ref={mapRef}>
        <Suspense fallback="More loading...">
          <KartOverlay>
            <SidebarPanels />
            <MetadataPanel />
            <Toolbar />
          </KartOverlay>

          <CustomControl>
            <Button onClick={saveDraft} disabled={dirtyFeatureIds.length === 0}>
              Lagre endringer
            </Button>
          </CustomControl>
          <CustomControl>
            <Button onClick={undo} disabled={dirtyFeatureIds.length === 0}>
              Undo
            </Button>
          </CustomControl>
          <CustomControl>
            <Button onClick={redo} disabled={!canRedo}>
              Redo
            </Button>
          </CustomControl>

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

const KartOverlay = styled.div`
  display: grid;

  @media (min-width: ${({ theme }) => theme.dimensions.lgPx}) {
    grid-template-columns: auto auto 1fr;
    grid-template-areas: "panel toolbar metadata";
  }

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
`;

export default Kart;

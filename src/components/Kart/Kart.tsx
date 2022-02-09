import { useEffect, useRef } from "react";
import styled from "styled-components";
import { map } from "./constants";
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

    updateGrenser(editFeatures);
  };

  return (
    <KartTarget ref={mapRef}>
      <KartOverlay>
        <SidebarPanels />
        <MetadataPanel selectedFeatures={selectedFeatures} />
      </KartOverlay>

      <CustomControl>
        <button onClick={saveDraft}>Lagre endringer</button>
      </CustomControl>

      <ZoomControls />
    </KartTarget>
  );
};

const KartTarget = styled.div`
  grid-area: map;
  position: relative;
  margin-left: -2px;

  .ol-control {
    text-align: center;
  }
`;

const KartOverlay = styled.div`
  display: grid;
  grid-template-rows: 3fr 400px;
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

export default Kart;

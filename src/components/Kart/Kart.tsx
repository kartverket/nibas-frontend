import { useEffect, useRef } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import styled from "styled-components";
import { map } from "./constants";
import ZoomControls from "./controls/ZoomControls";
import { updateGrenser } from "api/grenser";
import Bakgrunnskart from "components/Bakgrunnskart";
import CustomControl from "components/CustomControl";
import GrenserDrillDown from "components/GrenserDrillDown";
import useEditInteractions from "hooks/interactions/useEditInteractions";
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

  const saveDraft = async () => {
    const editLayer = getLayerById("edit");
    const editFeatures = editLayer.getSource().getFeatures();

    updateGrenser(editFeatures, tokenHolderFunc()?.token);
  };

  return (
    <KartTarget ref={mapRef}>
      <KartOverlay>
        <GrenserDrillDown />
        <Bakgrunnskart />
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
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
  z-index: 1;
`;

export default Kart;

import { useEffect, useRef } from "react";
import styled from "styled-components";
import { map } from "./constants";
import ZoomControls from "./controls/ZoomControls";
import { updateGrenser } from "api/grenser";
import Bakgrunnskart from "components/Bakgrunnskart";
import CustomControl from "components/CustomControl";
import GrenserDrillDown from "components/GrenserDrillDown";
import { OpenSidebarPanels } from "components/PageLayout/PageLayout";
import useEditInteractions from "hooks/interactions/useEditInteractions";
import { createLayers } from "hooks/layers/constants";
import { LayerId } from "hooks/layers/types";
import { getLayerById, initLayer } from "utils/map/layers";

const initLayers = () => {
  const layers = createLayers();

  Object.keys(layers).forEach((layerId) => {
    const layer = layers[layerId as LayerId];
    initLayer(layer, layerId as LayerId);
  });
};

initLayers();

type Props = {
  openPanels: OpenSidebarPanels;
};

const Kart = ({ openPanels }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);

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

    updateGrenser(editFeatures);
  };

  return (
    <KartTarget ref={mapRef}>
      <KartOverlay>
        <GrenserDrillDown visible={openPanels.nibas} />
        <Bakgrunnskart visible={openPanels.backgroundLayers} />
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

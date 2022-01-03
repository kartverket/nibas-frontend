import { useEffect, useRef } from "react";
import styled from "styled-components";
import { map } from "./constants";
import ZoomControls from "./controls/ZoomControls";
import { updateFylkeFeatures } from "api/fylker";
import { updateKommuneFeatures } from "api/kommuner";
import Bakgrunnskart from "components/Bakgrunnskart";
import CustomControl from "components/CustomControl";
import GrenserDrillDown from "components/GrenserDrillDown";
import { EditingType } from "components/GrenserDrillDown/useEditGrenser";
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

const Kart = () => {
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
    const editingType = editLayer.get("type") as EditingType;
    const editFeatures = editLayer.getSource().getFeatures();

    if (!editingType) return;

    switch (editingType) {
      case "fylke": {
        updateFylkeFeatures(editFeatures);
        break;
      }
      case "kommune": {
        updateKommuneFeatures(editFeatures);
        break;
      }
    }
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

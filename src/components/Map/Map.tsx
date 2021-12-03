import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { map } from "./constants";
import ZoomControls from "./controls/ZoomControls";
import { updateFylkeFeatures } from "api/fylker";
import { updateKommuneFeatures } from "api/kommuner";
import CustomControl from "components/CustomControl";
import GrenserDrillDown from "components/GrenserDrillDown";
import { EditingType } from "components/GrenserDrillDown/useEditGrenser";
import LayerOrdering from "components/LayerOrdering";
import { OpenSidebarPanels } from "components/PageLayout/PageLayout";
import useEditInteractions from "hooks/interactions/useEditInteractions";
import { createLayers } from "hooks/layers/constants";
import { LayerId } from "hooks/layers/types";
import useVisibleLayers from "hooks/layers/useVisibleLayers";
import useZIndexes from "hooks/layers/useZIndexes";
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

const Map = ({ openPanels }: Props) => {
  const { moveLayerUp, moveLayerDown, layersInZIndexOrder, moveLayer } =
    useZIndexes();
  const mapRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);

  const { visibleLayers, dispatch } = useVisibleLayers();

  useEditInteractions(editing);

  useEffect(() => {
    // mapRef kan egentlig ikke være null her,
    // MapTarget blir rendret før denne useEffect'en blir kjørt
    if (!mapRef.current) return;

    map.setTarget(mapRef.current);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  const toggleEditingInteractions = () => {
    setEditing(!editing);
  };

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
    <MapTarget ref={mapRef}>
      <MapOverlay>
        <GrenserDrillDown visible={openPanels.nibas} />
        <LayerOrdering
          visible={openPanels.backgroundLayers}
          visibleLayers={visibleLayers}
          dispatch={dispatch}
        />
      </MapOverlay>

      <CustomControl>
        <button onClick={toggleEditingInteractions}>
          {editing ? "Stopp endre valgte objekter" : "Endre valgte objekter"}
        </button>
      </CustomControl>

      <CustomControl>
        <button onClick={saveDraft}>Lagre endringer</button>
      </CustomControl>

      <ZoomControls />
    </MapTarget>
  );
};

const MapTarget = styled.div`
  grid-area: map;
  position: relative;

  .ol-control {
    text-align: center;
  }
`;

const MapOverlay = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
  z-index: 1;
`;

export default Map;

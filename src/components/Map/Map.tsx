import { useEffect, useRef } from "react";
import styled from "styled-components";
import { map } from "./constants";
import ZoomControls from "./controls/ZoomControls";
import MetadataPanel from "./MetadataPanel";
import SidebarPanels from "./SidebarPanels";
import { updateFylkeFeatures } from "api/fylker";
import { updateKommuneFeatures } from "api/kommuner";
import CustomControl from "components/CustomControl";
import { EditingType } from "components/GrenserDrillDown/useEditGrenser";
import { OpenSidebarPanels } from "components/PageLayout/PageLayout";
import useEditInteractions from "hooks/interactions/useEditInteractions";
import useSelectInteraction from "hooks/interactions/useSelectInteraction";
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

const Map = ({ openPanels }: Props) => {
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
        <SidebarPanels openPanels={openPanels} />
        <MetadataPanel selectedFeatures={selectedFeatures} />
      </MapOverlay>

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
  display: grid;
  grid-template-rows: 3fr 1fr;
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

export default Map;

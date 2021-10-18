import { useState } from "react";
import styled from "styled-components";
import useInteractions from "hooks/interactions/useInteractions";
import useLayers from "hooks/layers/useLayers";
import useDefaultControls from "hooks/useDefaultControls";
import CustomControl from "components/CustomControl";
import { useMap } from "./MapContext";
import { useAsyncSources } from "hooks/sources/useAsyncSources";
import { LayerId } from "hooks/layers/types";
import { getLayerById, getLayersArray, isLayerVisible } from "utils/map/layers";

const Map = () => {
  const { mapRef, map } = useMap();
  const [editing, setEditing] = useState(false);

  const canEditKommuner = !!map && isLayerVisible(map, "kommuner") && editing;

  const asyncSources = useAsyncSources();

  useLayers(asyncSources);
  useInteractions(asyncSources.kommuner, canEditKommuner);
  useDefaultControls();

  const layerIds = getLayersArray(map).map((layer) => layer.get("id"));

  const toggleLayerVisibility = (layerId: LayerId) => {
    if (!map) return;

    const layer = getLayerById(map, layerId);

    if (!layer) return;

    layer.setVisible(!layer.getVisible());
  };

  return (
    <MapTarget ref={mapRef}>
      <CustomControl>
        <button onClick={() => setEditing(!editing)}>
          {editing ? "Stop editing" : "Edit"}
        </button>
      </CustomControl>

      {layerIds.map((layerId) => (
        <CustomControl key={layerId}>
          <button onClick={() => toggleLayerVisibility(layerId as LayerId)}>
            Toggle {layerId}
          </button>
        </CustomControl>
      ))}
    </MapTarget>
  );
};

const MapTarget = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;

  .ol-control {
    text-align: center;
  }
`;

export default Map;

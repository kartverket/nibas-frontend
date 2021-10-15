import { useState } from "react";
import styled from "styled-components";
import useInteractions from "hooks/interactions/useInteractions";
import useLayers from "hooks/layers/useLayers";
import useDefaultControls from "hooks/useDefaultControls";
import CustomControl from "components/CustomControl";
import { useMap } from "./MapContext";
import { useSources } from "hooks/sources/useSources";
import { LayerId } from "hooks/layers/types";
import { getLayerById, isLayerVisible } from "utils/map/layers";

const Map = () => {
  const { mapRef, map } = useMap();
  const [editing, setEditing] = useState(false);

  const canEditKommuner = !!map && isLayerVisible(map, "kommuner") && editing;

  const sources = useSources();
  useLayers(sources);
  useInteractions(sources, canEditKommuner);
  useDefaultControls();

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

      {Object.keys(sources).map((layerId) => (
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

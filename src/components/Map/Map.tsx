import { useState } from "react";
import styled from "styled-components";
import useInteractions from "hooks/interactions/useInteractions";
import useLayers from "hooks/layers/useLayers";
import useDefaultControls from "hooks/useDefaultControls";
import CustomControl from "components/CustomControl";
import { useMap } from "./MapContext";
import {
  toggleLayerVisibility,
  useVisibleLayers,
} from "hooks/layers/useVisibleLayers";
import { useSources } from "hooks/sources/useSources";
import { LayerId } from "hooks/layers/types";

const Map = () => {
  const { mapRef } = useMap();
  const [forceHideKommuner, setForceHideKommuner] = useState(false);
  const [editing, setEditing] = useState(false);

  const { visibleLayers, dispatch } = useVisibleLayers();

  const sources = useSources();
  useLayers(sources, visibleLayers);
  useInteractions(sources, visibleLayers.kommuner && editing);
  useDefaultControls();

  const toggleKommunerLayer = () => {
    setForceHideKommuner(!forceHideKommuner);
    dispatch(toggleLayerVisibility("kommuner"));
  };

  return (
    <MapTarget ref={mapRef}>
      <CustomControl>
        <button onClick={toggleKommunerLayer}>
          {forceHideKommuner ? "Vis" : "Skjul"} kommuner
        </button>
      </CustomControl>
      <CustomControl>
        <button onClick={() => setEditing(!editing)}>
          {editing ? "Stop editing" : "Edit"}
        </button>
      </CustomControl>

      {Object.keys(visibleLayers).map((layerId) => (
        <CustomControl key={layerId}>
          <button
            onClick={() => dispatch(toggleLayerVisibility(layerId as LayerId))}
          >
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

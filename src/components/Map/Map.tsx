import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useInteractions from "hooks/interactions/useInteractions";
import useLayers from "hooks/layers/useLayers";
import useDefaultControls from "hooks/useDefaultControls";
import CustomControl from "components/CustomControl";
import { useAsyncSources } from "hooks/sources/useAsyncSources";
import { LayerId } from "hooks/layers/types";
import { isLayerVisible, toggleLayerVisibility } from "utils/map/layers";
import { map } from "./constants";
import useZIndexes from "hooks/layers/useZIndexes";

const Map: React.FC = ({ children }) => {
  const { moveLayerUp, moveLayerDown, layersInZIndexOrder, moveLayer } =
    useZIndexes();
  const mapRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // mapRef kan egentlig ikke være null her,
    // MapTarget blir rendret før denne useEffect'en blir kjørt
    if (!mapRef.current) return;

    map.setTarget(mapRef.current);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  const canEditKommuner = !!map && isLayerVisible(map, "kommuner") && editing;

  const asyncSources = useAsyncSources();

  useLayers(asyncSources);
  useInteractions(asyncSources.kommuner, canEditKommuner);
  useDefaultControls();

  return (
    <MapTarget ref={mapRef}>
      <MapOverlay>{children}</MapOverlay>
      <CustomControl>
        <button onClick={() => setEditing(!editing)}>
          {editing ? "Stop editing" : "Edit"}
        </button>
      </CustomControl>

      <CustomControl>
        <button onClick={() => moveLayer("topografiskNorgeskart", 10)}>
          Topo to top
        </button>
      </CustomControl>

      {layersInZIndexOrder.map((layerId, i) => (
        // index som key gjør at controls rerendres ordentlig
        <CustomControl key={i}>
          <div>
            {i < layersInZIndexOrder.length - 1 && (
              <button onClick={() => moveLayerDown(layerId as LayerId)}>
                Down
              </button>
            )}
            <button
              onClick={() => toggleLayerVisibility(map, layerId as LayerId)}
            >
              Toggle {layerId}
            </button>
            {i > 0 && (
              <button onClick={() => moveLayerUp(layerId as LayerId)}>
                Up
              </button>
            )}
          </div>
        </CustomControl>
      ))}
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

export const MapInteractable = styled.div`
  display: inline-block;
  border: 1px solid red;
  background-color: white;
`;

const MapOverlay = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
  z-index: 1;

  ${MapInteractable} {
    pointer-events: auto;
  }
`;

export default Map;

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useInteractions from "hooks/interactions/useInteractions";
import useLayers from "hooks/layers/useLayers";
import useDefaultControls from "hooks/useDefaultControls";
import CustomControl from "components/CustomControl";
import { useAsyncSources } from "hooks/sources/useAsyncSources";
import { LayerId } from "hooks/layers/types";
import { getLayerById, isLayerVisible } from "utils/map/layers";
import { map } from "./constants";
import useZIndexes from "hooks/layers/useZIndexes";

const Map = () => {
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
            <button onClick={() => toggleLayerVisibility(layerId as LayerId)}>
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
  width: 100vw;
  height: 100vh;
  position: relative;

  .ol-control {
    text-align: center;
  }
`;

export default Map;

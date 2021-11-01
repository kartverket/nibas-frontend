import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useInteractions from "hooks/interactions/useInteractions";
import useAsyncLayers from "hooks/layers/useAsyncLayers";
import useDefaultControls from "hooks/useDefaultControls";
import CustomControl from "components/CustomControl";
import { useAsyncSources } from "hooks/sources/useAsyncSources";
import { LayerId } from "hooks/layers/types";
import { isLayerVisible } from "utils/map/layers";
import { map } from "./constants";
import useZIndexes from "hooks/layers/useZIndexes";
import LayerOrdering from "components/LayerOrdering";
import useVisibleLayers, {
  toggleLayerVisibility,
} from "hooks/layers/useVisibleLayers";
import useSyncLayers from "hooks/layers/useSyncLayers";
import { sourceToGeoJson } from "utils/map/geoJson";

type Props = {
  backgroundLayersOpen: boolean;
  editingOpen: boolean;
};

const Map = ({ backgroundLayersOpen }: Props) => {
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

  const { visibleLayers, dispatch } = useVisibleLayers();
  const asyncSources = useAsyncSources();

  useSyncLayers();
  useAsyncLayers(asyncSources);
  useInteractions(asyncSources.kommuner, canEditKommuner);
  useDefaultControls();

  return (
    <MapTarget ref={mapRef}>
      <MapOverlay>
        {backgroundLayersOpen && (
          <LayerOrdering visibleLayers={visibleLayers} dispatch={dispatch} />
        )}
      </MapOverlay>

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

      <CustomControl>
        <button
          onClick={() => console.log(sourceToGeoJson(asyncSources.kommuner))}
        >
          Save
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
              onClick={() =>
                dispatch(toggleLayerVisibility(layerId as LayerId))
              }
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

const MapOverlay = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
  z-index: 1;
`;

export default Map;

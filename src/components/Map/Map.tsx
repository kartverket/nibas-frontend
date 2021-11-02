import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useInteractions from "hooks/interactions/useInteractions";
import useAsyncLayers from "hooks/layers/useAsyncLayers";
import useDefaultControls from "hooks/useDefaultControls";
import CustomControl from "components/CustomControl";
import { useAsyncSources } from "hooks/sources/useAsyncSources";
import { LayerId } from "hooks/layers/types";
import { getLayerById, getLayerIds, isLayerVisible } from "utils/map/layers";
import { map } from "./constants";
import useSyncLayers from "hooks/layers/useSyncLayers";

const Map = () => {
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

  const canEditKommuner = !!map && isLayerVisible("kommuner") && editing;

  useSyncLayers();
  const asyncSources = useAsyncSources();
  useAsyncLayers(asyncSources);
  useInteractions(asyncSources.kommuner, canEditKommuner);
  useDefaultControls();

  const layerIds = getLayerIds();

  const toggleLayerVisibility = (layerId: LayerId) => {
    const layer = getLayerById(layerId);

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

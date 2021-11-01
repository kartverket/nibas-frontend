import { useMap } from "components/Map/MapContext";
import { SyncSourceId } from "hooks/sources/types";
import { useEffect } from "react";
import { addLayerIfNotExists } from "utils/map/layers";
import { getSyncLayers } from "./constants";

const useSyncLayers = () => {
  const { map } = useMap();

  // legg alle konstante sources inn i layer
  useEffect(() => {
    if (!map) return;

    const syncLayers = getSyncLayers();

    Object.keys(syncLayers).forEach((sourceId) => {
      const layer = syncLayers[sourceId as SyncSourceId];
      layer.set("id", sourceId);
      addLayerIfNotExists(map, layer);
    });
  }, [map]);
};

export default useSyncLayers;

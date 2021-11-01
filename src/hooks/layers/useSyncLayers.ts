import { map } from "components/Map/constants";
import { SyncSourceId } from "hooks/sources/types";
import { useEffect } from "react";
import { addLayerIfNotExists } from "utils/map/layers";
import { getSyncLayers } from "./constants";

const useSyncLayers = () => {
  // legg alle konstante sources inn i layer
  useEffect(() => {
    const syncLayers = getSyncLayers();

    Object.keys(syncLayers).forEach((sourceId) => {
      const layer = syncLayers[sourceId as SyncSourceId];
      layer.set("id", sourceId);
      addLayerIfNotExists(map, layer);
    });
  }, []);
};

export default useSyncLayers;

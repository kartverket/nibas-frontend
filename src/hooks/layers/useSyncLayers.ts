import { map } from "components/Map/constants";
import { SyncSourceId } from "hooks/sources/types";
import { useEffect } from "react";
import { addLayerIfNotExists } from "utils/map/layers";
import { getSyncLayers, INITIAL_VISIBILITY } from "./constants";

const useSyncLayers = () => {
  // legg alle konstante sources inn i layer
  useEffect(() => {
    const syncLayers = getSyncLayers();

    Object.keys(syncLayers).forEach((sourceId) => {
      const layer = syncLayers[sourceId as SyncSourceId];
      layer.set("id", sourceId);
      layer.setVisible(INITIAL_VISIBILITY[sourceId as SyncSourceId]);
      addLayerIfNotExists(map, layer);
    });
  }, []);
};

export default useSyncLayers;

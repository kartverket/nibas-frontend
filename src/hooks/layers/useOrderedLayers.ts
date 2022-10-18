import { useEffect, useState } from "react";
import { bakgrunnskartLayers } from "./constants";
import { BakgrunnskartId, ByLayerId } from "./types";
import { getLayerById } from "utils/map/layers";

export type LayerOrder = ByLayerId<number>;

const useOrderedLayers = () => {
  const [orderedLayerIds, setOrderedLayerIds] = useState<BakgrunnskartId[]>([]);

  useEffect(() => {
    setOrderedLayerIds(Object.keys(bakgrunnskartLayers) as BakgrunnskartId[]);
  }, []);

  // sett z-index i OL Map
  useEffect(() => {
    orderedLayerIds.forEach((layerId, i) => {
      const layer = getLayerById(layerId as BakgrunnskartId);

      if (!layer) return;

      // bakgrunnskart vil alltid ha negativ z-index
      // denne oppdaterer faktisk z-indexen på laget i kartet
      layer.setZIndex(-i - 1);
    });
  }, [orderedLayerIds]);

  return {
    orderedLayerIds,
  };
};

export default useOrderedLayers;

import { useEffect, useState } from "react";
import { ByLayerId, LayerId } from "./types";
import { getLayerById, getWMSLayersInMap } from "utils/map/layers";

export type ZIndexes = ByLayerId<number>;

const useZIndexes = () => {
  const [zIndexes, setZIndexes] = useState<LayerId[]>(
    getWMSLayersInMap().map((layer) => layer.get("id"))
  );

  // sett z-index i OL Map
  useEffect(() => {
    zIndexes.forEach((layerId, i) => {
      const layer = getLayerById(layerId as LayerId);

      if (!layer) return;

      // bakgrunnskart vil alltid ha negativ z-index
      layer.setZIndex(-i);
    });
  }, [zIndexes]);

  const moveLayer = (direction: "up" | "down", layerId: LayerId) => {
    const indexDifference = direction === "up" ? 1 : -1;

    const index = zIndexes.indexOf(layerId);

    const newZIndexes = [...zIndexes];
    newZIndexes.splice(index, 1);
    newZIndexes.splice(index + indexDifference, 0, layerId);

    setZIndexes(newZIndexes);
  };

  return {
    zIndexes,
    moveLayer,
  };
};

export default useZIndexes;

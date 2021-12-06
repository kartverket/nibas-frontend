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
      layer.setZIndex(zIndexes.length - i);
    });
  }, [zIndexes]);

  const moveLayerUp = (layerId: LayerId) => {
    const index = zIndexes.indexOf(layerId);

    const newZIndexes = [...zIndexes];
    newZIndexes.splice(index, 1);
    newZIndexes.splice(index + 1, 0, layerId);

    setZIndexes(newZIndexes);
  };

  const moveLayerDown = (layerId: LayerId) => {
    const index = zIndexes.indexOf(layerId);

    const newZIndexes = [...zIndexes];
    newZIndexes.splice(index, 1);
    newZIndexes.splice(index - 1, 0, layerId);

    setZIndexes(newZIndexes);
  };

  const moveLayer = (direction: "up" | "down", layerId: LayerId) => {
    if (direction === "up") {
      moveLayerUp(layerId);
    } else {
      moveLayerDown(layerId);
    }
  };

  return {
    zIndexes,
    moveLayer,
    layersInZIndexOrder: zIndexes,
  };
};

export default useZIndexes;

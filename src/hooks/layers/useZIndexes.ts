import { useEffect, useState } from "react";
import { bakgrunnskartLayers } from "./constants";
import { ByLayerId } from "./types";
import { BakgrunnskartId } from "hooks/sources/types";
import { getLayerById } from "utils/map/layers";

export type ZIndexes = ByLayerId<number>;

const useZIndexes = () => {
  const [zIndexes, setZIndexes] = useState<BakgrunnskartId[]>([]);

  useEffect(() => {
    setZIndexes(
      Object.values(bakgrunnskartLayers).map((layer) => layer.get("id"))
    );
  }, []);

  // sett z-index i OL Map
  useEffect(() => {
    zIndexes.forEach((layerId, i) => {
      const layer = getLayerById(layerId as BakgrunnskartId);

      if (!layer) return;

      // bakgrunnskart vil alltid ha negativ z-index
      layer.setZIndex(-i);
    });
  }, [zIndexes]);

  const moveLayer = (direction: "up" | "down", layerId: BakgrunnskartId) => {
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

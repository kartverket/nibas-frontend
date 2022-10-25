import { useEffect, useState } from "react";
import { bakgrunnskartLayers } from "./constants";
import { BakgrunnskartId } from "./types";
import { getLayerById } from "utils/map/layers";

const useVisibleLayers = () => {
  const [visibleLayers, setVisibleLayers] = useState<BakgrunnskartId[]>([
    "cachetjenester" as BakgrunnskartId,
  ]);

  // sett synlighet til layer i map til ny verdi
  useEffect(() => {
    for (const bakgrunnsLayer of Object.keys(bakgrunnskartLayers)) {
      const layer = getLayerById(bakgrunnsLayer as BakgrunnskartId);
      layer?.setVisible(false);
    }

    visibleLayers.forEach((layerId, i) => {
      const layer = getLayerById(layerId as BakgrunnskartId);
      layer?.setVisible(true);
      layer.setZIndex(-i - 1);
    });
  }, [visibleLayers]);

  const toggleLayerVisibility = (layerId: BakgrunnskartId) => {
    const visible = visibleLayers.includes(layerId);
    if (visible) {
      setVisibleLayers(visibleLayers.filter((vl) => vl !== layerId));
    } else {
      setVisibleLayers([layerId, ...visibleLayers]);
    }
  };

  const moveLayer = (direction: "up" | "down", layerId: BakgrunnskartId) => {
    const indexDifference = direction === "up" ? 1 : -1;
    const index = visibleLayers.indexOf(layerId);
    const newZIndexes = [...visibleLayers];
    newZIndexes.splice(index, 1);
    newZIndexes.splice(index + indexDifference, 0, layerId);

    setVisibleLayers(newZIndexes);
  };

  return { visibleLayers, moveLayer, toggleLayerVisibility };
};

export default useVisibleLayers;

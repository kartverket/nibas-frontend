import { map } from "components/Map/constants";
import { useEffect, useMemo, useState } from "react";
import { getLayerById } from "utils/map/layers";
import { ByLayerId, LayerId } from "./types";

export type ZIndexes = ByLayerId<number>;

const getLayerIdByZIndex = (zIndexes: ZIndexes, zIndex: number) => {
  const layerIds = Object.keys(zIndexes).filter(
    (layerId) => zIndexes[layerId as LayerId] === zIndex
  );

  if (layerIds.length === 0) return null;

  if (layerIds.length > 1) {
    throw new Error("Multiple layers found with z-index " + layerIds.length);
  }

  return layerIds[0] as LayerId;
};

const getSwappedIndexes = (
  zIndexes: ZIndexes,
  layerId1: LayerId,
  layerId2: LayerId
) => {
  const index1 = zIndexes[layerId1];
  const index2 = zIndexes[layerId2];
  const newIndexes = { ...zIndexes };

  newIndexes[layerId1] = index2;
  newIndexes[layerId2] = index1;

  return newIndexes;
};

const useZIndexes = () => {
  const [zIndexes, setZIndexes] = useState<ZIndexes>({
    topografiskNorgeskart: 0,
    administrativeGrenser: 1,
    fylker: 2,
    kommuner: 3,
    stedsnavn: 4,
    background: -1,
    matrikkelen: -2,
    vector: -3,
  });

  const layersInZIndexOrder = useMemo(() => {
    return Object.keys(zIndexes).sort((layerId1, layerId2) => {
      const castLayerId1 = layerId1 as LayerId;
      const castLayerId2 = layerId2 as LayerId;

      if (zIndexes[castLayerId1] < zIndexes[castLayerId2]) {
        return 1;
      } else if (zIndexes[castLayerId1] > zIndexes[castLayerId2]) {
        return -1;
      }

      return 0;
    }) as LayerId[];
  }, [zIndexes]);

  // sett z-index i OL Map
  useEffect(() => {
    Object.keys(zIndexes).forEach((layerId) => {
      const layer = getLayerById(map, layerId as LayerId);
      layer?.setZIndex(zIndexes[layerId as LayerId]);
    });
  }, [zIndexes]);

  const swapLayers = (layerId1: LayerId, layerId2: LayerId) => {
    const newIndexes = getSwappedIndexes(zIndexes, layerId1, layerId2);
    setZIndexes(newIndexes);
  };

  const moveLayerUp = (layerId: LayerId) => {
    const index = zIndexes[layerId];
    const swappingLayerId = getLayerIdByZIndex(zIndexes, index + 1);

    if (!swappingLayerId) return;

    swapLayers(layerId, swappingLayerId);
  };

  const moveLayerDown = (layerId: LayerId) => {
    const index = zIndexes[layerId];
    const swappingLayerId = getLayerIdByZIndex(zIndexes, index - 1);

    if (!swappingLayerId) return;

    swapLayers(layerId, swappingLayerId);
  };

  const moveLayer = (layerId: LayerId, newIndex: number) => {
    const oldIndex = zIndexes[layerId];

    if (oldIndex === newIndex) return;

    let newIndexes = { ...zIndexes };

    if (oldIndex > newIndex) {
      // flytt laget nedover ved å bytte plass på dem frem til newIndex
      for (let i = oldIndex; i > newIndex + 1; i--) {
        const layerIdAtZIndex = getLayerIdByZIndex(newIndexes, i);

        if (!layerIdAtZIndex) continue;

        newIndexes = getSwappedIndexes(newIndexes, layerId, layerIdAtZIndex);
      }
    } else {
      // flytt laget oppover ved å bytte plass på dem frem til newIndex
      for (let i = oldIndex; i < newIndex - 1; i++) {
        const layerIdAtZIndex = getLayerIdByZIndex(newIndexes, i);

        if (!layerIdAtZIndex) continue;

        newIndexes = getSwappedIndexes(newIndexes, layerId, layerIdAtZIndex);
      }
    }

    setZIndexes(newIndexes);
  };

  return {
    zIndexes,
    moveLayer,
    moveLayerDown,
    moveLayerUp,
    layersInZIndexOrder,
  };
};

export default useZIndexes;

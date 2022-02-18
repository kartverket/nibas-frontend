import React, { createContext, useContext, useEffect, useState } from "react";
import { bakgrunnskartLayers } from "hooks/layers/constants";
import { BakgrunnskartId } from "hooks/layers/types";
import useVisibleLayers, {
  toggleLayerVisibility,
  VisibleLayers,
} from "hooks/layers/useVisibleLayers";
import useZIndexes from "hooks/layers/useZIndexes";
import getSubLayersFromWMSSource, {
  MainMappedLayer,
} from "utils/getLayersFromWMS";
import { mapVectorLayer } from "utils/getMatrikkelWfsFeatures";
import { isVectorLayer } from "utils/map/layers";

const BakgrunnskartContext = createContext<
  | {
      mappedLayers: MainMappedLayer[];
      visibleLayers: VisibleLayers;
      toggleLayerVisibility: (layerId: BakgrunnskartId) => void;
      zIndexes: BakgrunnskartId[];
      moveLayer: (direction: "up" | "down", layerId: BakgrunnskartId) => void;
    }
  | undefined
>(undefined);

export const BakgrunnskartProvider: React.FC = ({ children }) => {
  const [mappedLayers, setMappedLayers] = useState<MainMappedLayer[]>([]);

  const { visibleLayers, dispatch } = useVisibleLayers();
  const { moveLayer, zIndexes } = useZIndexes();

  useEffect(() => {
    let isMounted = true;

    const updateMappedLayers = async () => {
      const mappedLayerPromises: Promise<MainMappedLayer | null>[] = [];

      Object.values(bakgrunnskartLayers).forEach((layer) => {
        if (isVectorLayer(layer)) {
          mappedLayerPromises.push(mapVectorLayer());
          return;
        }

        mappedLayerPromises.push(getSubLayersFromWMSSource(layer.getSource()));
      });

      const layers = await Promise.all(mappedLayerPromises);

      const nonNullLayers = layers.filter(
        (layer) => layer !== null
      ) as MainMappedLayer[];

      if (isMounted) {
        setMappedLayers(nonNullLayers);
      }
    };

    updateMappedLayers();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    mappedLayers,
    visibleLayers,
    toggleLayerVisibility: (layerId: BakgrunnskartId) =>
      dispatch(toggleLayerVisibility(layerId)),
    moveLayer,
    zIndexes,
  };

  return (
    <BakgrunnskartContext.Provider value={value}>
      {children}
    </BakgrunnskartContext.Provider>
  );
};

export const useBakgrunnskart = () => {
  const context = useContext(BakgrunnskartContext);

  if (!context) {
    throw new Error(
      "useBakgrunnskart must be used within a BakgrunnskartProvider"
    );
  }

  return context;
};

import React, { createContext, useContext, useEffect, useState } from "react";
import { bakgrunnskartLayers } from "hooks/layers/constants";
import { BakgrunnskartId } from "hooks/layers/types";
import useVisibleLayers, { VisibleLayer } from "hooks/layers/useVisibleLayers";
import getSubLayersFromWMSSource, {
  MainMappedLayer,
  MappedLayer,
} from "utils/getLayersFromWMS";
import { mapVectorLayer } from "utils/getMatrikkelWfsFeatures";
import { isVectorLayer } from "utils/map/layers";

export type BakgrunnskartContextValue = {
  mappedLayers: MainMappedLayer[];
  visibleLayers: VisibleLayer[];
  toggleLayerVisibility: (layerId: BakgrunnskartId, subLayer?: string) => void;
  layerIsVisible: (layerId: BakgrunnskartId) => boolean;
  subLayerIsVisible: (mainLayer: BakgrunnskartId, subLayer: string) => boolean;
  recursiveIsVisible: (
    mainLayer: BakgrunnskartId,
    layer: MappedLayer
  ) => boolean;
  moveLayer: (direction: "up" | "down", layerId: BakgrunnskartId) => void;
};

/**
 * Bruk heller BakgrunnskartProvider i koden
 */
export const BakgrunnskartContext = createContext<
  BakgrunnskartContextValue | undefined
>(undefined);

export const BakgrunnskartProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mappedLayers, setMappedLayers] = useState<MainMappedLayer[]>([]);

  const {
    visibleLayers,
    moveLayer,
    toggleLayerVisibility,
    recursiveIsVisible,
    layerIsVisible,
    subLayerIsVisible,
  } = useVisibleLayers();

  useEffect(() => {
    let isMounted = true;

    const updateMappedLayers = async () => {
      const mappedLayerPromises = Object.values(bakgrunnskartLayers).map(
        (layer) => {
          if (isVectorLayer(layer)) {
            return mapVectorLayer();
          }
          const source = layer.getSource();
          if (source) {
            return getSubLayersFromWMSSource(source);
          }
        }
      );

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
    toggleLayerVisibility,
    moveLayer,
    recursiveIsVisible,
    layerIsVisible,
    subLayerIsVisible,
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

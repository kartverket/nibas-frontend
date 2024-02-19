import React, { createContext, useContext, useEffect, useState } from "react";
import { kartlagLayers } from "hooks/layers/constants";
import { KartlagId } from "hooks/layers/types";
import useVisibleLayers, { VisibleLayer } from "contexts/KartlagContext/useVisibleLayers";
import getSubLayersFromWMSSource, { MappedLayer } from "utils/getLayersFromWMS";
import { isVectorLayer } from "utils/map/layers";

export type KartlagContextValue = {
  mappedLayers: MappedLayer[];
  visibleLayers: VisibleLayer[];
  toggleLayerVisibility: (layerId: KartlagId, subLayer?: string, replaceSubLayer?: boolean) => void;
  layerIsVisible: (layerId: KartlagId) => boolean;
  subLayerIsVisible: (mainLayer: KartlagId, subLayer: string) => boolean;
  moveLayer: (direction: "up" | "down", layerId: KartlagId) => void;
  resetKartlag: () => void;
};

/**
 * Bruk heller KartlagProvider i koden
 */
export const KartlagContext = createContext<KartlagContextValue | undefined>(undefined);

export const KartlagProvider = ({ children }: { children: React.ReactNode }) => {
  const [mappedLayers, setMappedLayers] = useState<MappedLayer[]>([]);

  const { visibleLayers, toggleLayerVisibility, layerIsVisible, subLayerIsVisible, resetVisibleLayers } =
    useVisibleLayers();

  // TODO: visible layers må slås inn i mappedlayers for at dette skal ha noe effekt i kartet
  const moveLayer = (direction: "up" | "down", layerId: KartlagId) => {
    const layer = mappedLayers.find((mappedLayer) => mappedLayer.sourceId === layerId);

    if (layer) {
      const indexDifference = direction === "up" ? -1 : 1;
      const index = mappedLayers.indexOf(layer);
      const newZIndexes = [...mappedLayers];
      newZIndexes.splice(index, 1);
      newZIndexes.splice(index + indexDifference, 0, layer);
      setMappedLayers(newZIndexes);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const updateMappedLayers = async () => {
      const mappedLayerPromises = Object.entries(kartlagLayers).map(([id, layer]) => {
        if (isVectorLayer(layer)) {
          return {
            layers: [],
            queryable: true,
            sourceId: id,
            title: id,
            id: id,
          };
        }
        const source = layer.getSource();
        if (source) {
          return getSubLayersFromWMSSource(source);
        }
      });

      const layers = await Promise.all(mappedLayerPromises);

      const nonNullLayers = layers.filter((layer) => layer !== null) as MappedLayer[];

      if (isMounted) {
        setMappedLayers(nonNullLayers);
      }
    };

    updateMappedLayers();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetKartlag = () => {
    resetVisibleLayers();
  };

  const value = {
    mappedLayers,
    visibleLayers,
    toggleLayerVisibility,
    moveLayer,
    layerIsVisible,
    subLayerIsVisible,
    resetKartlag,
  };

  return <KartlagContext.Provider value={value}>{children}</KartlagContext.Provider>;
};

export const useKartlag = () => {
  const context = useContext(KartlagContext);

  if (!context) {
    throw new Error("useKartlag must be used within a KartlagProvider");
  }

  return context;
};

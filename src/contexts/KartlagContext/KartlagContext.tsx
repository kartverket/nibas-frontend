import React, { createContext, useContext, useEffect, useState } from "react";
import { kartlagLayers } from "hooks/layers/constants";
import { KartlagId } from "hooks/layers/types";
import useVisibleLayers from "contexts/KartlagContext/useVisibleLayers";
import getSubLayersFromWMSSource from "utils/getLayersFromWMS";
import { isVectorLayer } from "utils/map/layers";

export type MappedLayer = {
  sourceId: KartlagId;
  id: string;
  title: string;
  layers: MappedLayer[];
  isVisible: boolean;
};

export type KartlagContextValue = {
  mappedLayers: MappedLayer[];
  toggleLayerVisibility: (layerId: KartlagId, subLayer?: string, replaceSubLayer?: boolean) => void;
  moveLayer: (direction: "up" | "down", layerId: KartlagId) => void;
  resetKartlag: () => void;
};

/**
 * Bruk heller KartlagProvider i koden
 */
export const KartlagContext = createContext<KartlagContextValue | undefined>(undefined);

export const KartlagProvider = ({ children }: { children: React.ReactNode }) => {
  const [mappedLayers, setMappedLayers] = useState<MappedLayer[]>([]);

  const { toggleLayerVisibility, resetVisibleLayers } = useVisibleLayers();

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

  // Henter XML-data fra hver av tjenestene i kartlagslisten og mapper det over til noe mer brukbart
  useEffect(() => {
    // TODO: ta en sjekk et sted her for om laget vi mapper ligger i default layers, så skal isvisible være true?
    const mappedLayerPromises = Object.entries(kartlagLayers).map(([id, layer]) => {
      if (isVectorLayer(layer)) {
        const mappedLayer: MappedLayer = {
          sourceId: id as KartlagId,
          id: id,
          title: id,
          layers: [],
          isVisible: false,
        };
        return mappedLayer;
      }
      const source = layer.getSource();
      if (source) {
        return getSubLayersFromWMSSource(source);
      }
    });

    const isMappedLayer = (layer: MappedLayer | null | undefined): layer is MappedLayer => {
      return !!layer;
    };

    Promise.all(mappedLayerPromises).then((layers) => {
      const nonNullLayers = layers.filter(isMappedLayer);
      setMappedLayers(nonNullLayers);
    });
  }, []);

  const resetKartlag = () => {
    resetVisibleLayers();
  };

  const value = {
    mappedLayers,
    toggleLayerVisibility,
    moveLayer,
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

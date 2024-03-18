import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { kartlagLayers } from "hooks/layers/constants";
import { KartlagId } from "hooks/layers/types";
import { getLayersFromSource } from "contexts/KartlagContext/getLayersFromSource";
import { getLayerById, isWMSLayer, isWMTSLayer } from "utils/map/layers";
import {
  findAndToggleLayer,
  resetWMSLayer,
  resetWMTSLayer,
  setWMTSLayerVisibility,
  toggleLayerVisibility,
} from "./kartlag-utils";
import { isNotNil } from "utils/type-utils";

export type MappedLayer = {
  type: "wms" | "wmts";
  sourceId: KartlagId;
  id: string;
  title: string;
  sublayers: MappedLayer[];
  isVisible: boolean;
};

export type KartlagContextValue = {
  mappedLayers: MappedLayer[];
  toggleKartlag: (mappedLayer: MappedLayer, indexPath: number[]) => void;
  moveLayer: (direction: "up" | "down", layerId: KartlagId) => void;
  resetKartlag: () => void;
};

// Obs! Vi hardkoder et lag som er skrudd på når man åpner applikasjonen
// men den vil ikke fungere dersom tjenesten endrer navn på kartlaget
export const defaultKartlag = "norges_grunnkart_graatone";

export const KartlagContext = createContext<KartlagContextValue | undefined>(undefined);

export const KartlagProvider = ({ children }: { children: React.ReactNode }) => {
  const [mappedLayers, setMappedLayers] = useState<MappedLayer[]>([]);

  // Litt støttestate for å gjøre det lettere å tilbakestille senere
  const [defaultLayers, setDefaultLayers] = useState<MappedLayer[]>([]);
  const areLayersInitialized = useRef(false);

  // Henter XML-data fra hver av tjenestene i kartlagslisten og mapper det over til noe mer brukbart
  useEffect(() => {
    if (!areLayersInitialized.current) {
      const mappedLayerPromises = Object.entries(kartlagLayers).map(([layerId, layer]) => {
        const source = layer.getSource();
        if (source) {
          return getLayersFromSource(layerId as KartlagId, source);
        }
      });

      Promise.all(mappedLayerPromises).then((layers) => {
        const nonNullLayers = layers.filter(isNotNil);
        const initialLayers = findAndToggleLayer(defaultKartlag, nonNullLayers);
        setMappedLayers(initialLayers);
        setDefaultLayers(initialLayers);
        areLayersInitialized.current = true;
      });
    }
    return () => {
      areLayersInitialized.current = true;
    };
  }, []);

  // Når mappedLayers blir oppdatert setter vi zIndex på nytt for å sikre riktig rekkefølge i kartet
  useEffect(() => {
    mappedLayers.forEach((mappedLayer, index) => {
      const layer = getLayerById(mappedLayer.sourceId);
      layer.setZIndex(-index);
    });
  }, [mappedLayers]);

  const toggleKartlag = (mappedLayer: MappedLayer, indexPath: number[]) => {
    const toggledLayers = toggleLayerVisibility(0, mappedLayers, indexPath, !mappedLayer.isVisible);
    setMappedLayers(toggledLayers);
  };

  const moveLayer = (direction: "up" | "down", layerId: KartlagId) => {
    const mappedLayer = mappedLayers.find((ml) => ml.sourceId === layerId);

    if (mappedLayer) {
      const indexDifference = direction === "up" ? -1 : 1;
      const oldIndex = mappedLayers.indexOf(mappedLayer);
      const newIndex = oldIndex + indexDifference;
      const rearrangedLayers = [...mappedLayers];

      rearrangedLayers.splice(oldIndex, 1);
      rearrangedLayers.splice(newIndex, 0, mappedLayer);
      setMappedLayers(rearrangedLayers);
    }
  };

  const resetKartlag = () => {
    // Sett React-state tilbake til lagrede defaults så vi slipper rekursjon igjen
    setMappedLayers(defaultLayers);

    // Skru av alle kartlagene i OpenLayers
    Object.values(kartlagLayers).forEach((layer, index) => {
      layer.setZIndex(-index);
      if (isWMSLayer(layer)) resetWMSLayer(layer);
      if (isWMTSLayer(layer)) resetWMTSLayer(layer);
    });

    // Obs! Hardkodet toggling av defaultlaget vårt
    setWMTSLayerVisibility(getLayerById("cachetjenester"), true, defaultKartlag);
  };

  const value = {
    mappedLayers,
    toggleKartlag,
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

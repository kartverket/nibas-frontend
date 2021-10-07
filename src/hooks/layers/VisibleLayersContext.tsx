import React, { createContext, useCallback, useContext, useState } from "react";
import { LayerId } from "./types";

const VisibleLayersContext = createContext<
  | {
      setLayerVisibility: (layerId: LayerId, visible: boolean) => void;
      isLayerVisible: (layerId: LayerId) => boolean;
      toggleLayerVisibility: (layerId: LayerId) => void;
    }
  | undefined
>(undefined);

export const VisibleLayersProvider: React.FC = ({ children }) => {
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(
    {}
  );

  const setLayerVisibility = useCallback(
    (layerId: LayerId, visible: boolean) =>
      setVisibleLayers((prevLayers) => ({ ...prevLayers, [layerId]: visible })),
    []
  );

  const toggleLayerVisibility = useCallback((layerId: LayerId) => {
    setVisibleLayers((prevLayers) => ({
      ...prevLayers,
      [layerId]: !prevLayers[layerId],
    }));
  }, []);

  const isLayerVisible = useCallback(
    (layerId: LayerId) => visibleLayers[layerId],
    [visibleLayers]
  );

  const value = { toggleLayerVisibility, isLayerVisible, setLayerVisibility };

  return (
    <VisibleLayersContext.Provider value={value}>
      {children}
    </VisibleLayersContext.Provider>
  );
};

export const useVisibleLayers = () => {
  const context = useContext(VisibleLayersContext);

  if (!context) {
    throw new Error("useLayerContext must be used within a LayersContext");
  }

  return context;
};

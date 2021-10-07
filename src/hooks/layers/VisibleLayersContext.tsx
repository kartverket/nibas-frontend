import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useMap } from "components/Map/MapContext";

// https://kentcdodds.com/blog/how-to-use-react-context-effectively

const VisibleLayersContext = createContext<
  | {
      isLayerVisible: (layerId: string) => boolean;
      toggleLayer: (layerId: string) => void;
    }
  | undefined
>(undefined);

export const VisibleLayersProvider: React.FC = ({ children }) => {
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(
    {}
  );

  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const mapLayers = map.getLayers().getArray();

    const newVisibleLayers = mapLayers.reduce<typeof visibleLayers>(
      (acc, layer) => {
        const layerId = layer.get("id");

        return {
          ...acc,
          [layerId]: true,
        };
      },
      {}
    );

    setVisibleLayers(newVisibleLayers);
  }, [map]);

  const toggleLayer = useCallback(
    (layerId: string) => {
      setVisibleLayers({
        ...visibleLayers,
        [layerId]: !visibleLayers[layerId],
      });
    },
    [visibleLayers]
  );

  const isLayerVisible = useCallback(
    (layerId: string) => visibleLayers[layerId],
    [visibleLayers]
  );

  const value = { toggleLayer, isLayerVisible };

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

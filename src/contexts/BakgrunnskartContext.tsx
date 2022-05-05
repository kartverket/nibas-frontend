import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { bakgrunnskartLayers } from "hooks/layers/constants";
import { BakgrunnskartId } from "hooks/layers/types";
import useOrderedLayers from "hooks/layers/useOrderedLayers";
import useVisibleLayers, {
  toggleLayerVisibility,
  VisibleLayers,
} from "hooks/layers/useVisibleLayers";
import getSubLayersFromWMSSource, {
  MainMappedLayer,
} from "utils/getLayersFromWMS";
import { mapVectorLayer } from "utils/getMatrikkelWfsFeatures";
import { isVectorLayer } from "utils/map/layers";

export type BakgrunnskartContextValue = {
  mappedLayers: MainMappedLayer[];
  visibleLayers: VisibleLayers;
  toggleLayerVisibility: (layerId: BakgrunnskartId) => void;
  orderedLayerIds: BakgrunnskartId[];
  updateMappedLayers: () => void;
  moveLayer: (direction: "up" | "down", layerId: BakgrunnskartId) => void;
};

/**
 * Bruk heller BakgrunnskartProvider i koden
 */
export const BakgrunnskartContext = createContext<
  BakgrunnskartContextValue | undefined
>(undefined);

export const BakgrunnskartProvider: React.FC = ({ children }) => {
  const [mappedLayers, setMappedLayers] = useState<MainMappedLayer[]>([]);
  const isMounted = useRef(false);

  const { visibleLayers, dispatch } = useVisibleLayers();
  const { moveLayer, orderedLayerIds } = useOrderedLayers();

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  });

  const updateMappedLayers = useCallback(async () => {
    if (mappedLayers.length > 0) return;

    const mappedLayerPromises: Promise<MainMappedLayer | null>[] = [];

    Object.values(bakgrunnskartLayers).forEach((layer) => {
      if (isVectorLayer(layer)) {
        mappedLayerPromises.push(mapVectorLayer());
        return;
      }

      // antar feil fordi kode kjøres etter testen er ferdig
      mappedLayerPromises.push(getSubLayersFromWMSSource(layer.getSource()));
    });

    const layers = await Promise.all(mappedLayerPromises);

    const nonNullLayers = layers.filter(
      (layer) => layer !== null
    ) as MainMappedLayer[];

    if (isMounted.current) {
      setMappedLayers(nonNullLayers);
    }
  }, [mappedLayers]);

  // useEffect(() => {
  //   let isMounted = true;

  //   const updateMappedLayers = async () => {
  //     const mappedLayerPromises: Promise<MainMappedLayer | null>[] = [];

  //     Object.values(bakgrunnskartLayers).forEach((layer) => {
  //       if (isVectorLayer(layer)) {
  //         mappedLayerPromises.push(mapVectorLayer());
  //         return;
  //       }

  //       // antar feil fordi kode kjøres etter testen er ferdig
  //       mappedLayerPromises.push(getSubLayersFromWMSSource(layer.getSource()));
  //     });

  //     const layers = await Promise.all(mappedLayerPromises);

  //     const nonNullLayers = layers.filter(
  //       (layer) => layer !== null
  //     ) as MainMappedLayer[];

  //     if (isMounted) {
  //       setMappedLayers(nonNullLayers);
  //     }
  //   };

  //   updateMappedLayers();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);

  const value = {
    mappedLayers,
    visibleLayers,
    toggleLayerVisibility: (layerId: BakgrunnskartId) =>
      dispatch(toggleLayerVisibility(layerId)),
    moveLayer,
    orderedLayerIds,
    updateMappedLayers,
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

import { useEffect, useReducer } from "react";
import { BakgrunnskartId } from "hooks/sources/types";
import { getLayerById } from "utils/map/layers";

export type VisibleLayers = Record<BakgrunnskartId, boolean>;
type Action =
  | { type: "setLayerVisibility"; layerId: BakgrunnskartId; visible: boolean }
  | { type: "toggleLayerVisibility"; layerId: BakgrunnskartId };

// TODO optional med action creators, litt subjektivt
export const setLayerVisibility = (
  layerId: BakgrunnskartId,
  visible: boolean
): Action => ({
  type: "setLayerVisibility",
  layerId,
  visible,
});
export const toggleLayerVisibility = (layerId: BakgrunnskartId): Action => ({
  type: "toggleLayerVisibility",
  layerId,
});

const visibleLayersReducer = (state: VisibleLayers, action: Action) => {
  switch (action.type) {
    case "setLayerVisibility": {
      return {
        ...state,
        [action.layerId]: action.visible,
      };
    }
    case "toggleLayerVisibility": {
      return {
        ...state,
        [action.layerId]: !state[action.layerId],
      };
    }
  }
};

const useVisibleLayers = () => {
  const [visibleLayers, dispatch] = useReducer(visibleLayersReducer, {
    administrativeGrenser: false,
    stedsnavn: true,
    topografiskNorgeskart: true,
    norgesMaritimeGrenser: false,
  });

  // sett synlighet til layer i map til ny verdi
  useEffect(() => {
    Object.keys(visibleLayers).forEach((layerId) => {
      const layer = getLayerById(layerId as BakgrunnskartId);
      layer?.setVisible(visibleLayers[layerId as BakgrunnskartId]);
    });
  }, [visibleLayers]);

  return { visibleLayers, dispatch };
};

export default useVisibleLayers;

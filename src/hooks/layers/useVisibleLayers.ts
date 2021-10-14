import { useReducer } from "react";
import { ByLayerId, LayerId } from "./types";

export type VisibleLayers = ByLayerId<boolean>;
type Action =
  | { type: "setLayerVisibility"; layerId: LayerId; visible: boolean }
  | { type: "toggleLayerVisibility"; layerId: LayerId };

// TODO optional med action creators, litt subjektivt
export const setLayerVisibility = (
  layerId: LayerId,
  visible: boolean
): Action => ({
  type: "setLayerVisibility",
  layerId,
  visible,
});
export const toggleLayerVisibility = (layerId: LayerId): Action => ({
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

export const useVisibleLayers = () => {
  const [visibleLayers, dispatch] = useReducer(visibleLayersReducer, {
    administrativeGrenser: false,
    background: true,
    fylker: false,
    kommuner: true,
    vector: true,
  });

  return { visibleLayers, dispatch };
};

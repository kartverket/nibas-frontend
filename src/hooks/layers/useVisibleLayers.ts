import { useEffect, useReducer } from "react";
import { INITIAL_VISIBILITY } from "./constants";
import { ByLayerId, LayerId } from "./types";
import { getLayerById } from "utils/map/layers";

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

const useVisibleLayers = () => {
  const [visibleLayers, dispatch] = useReducer(
    visibleLayersReducer,
    INITIAL_VISIBILITY
  );

  // sett synlighet til layer i map til ny verdi
  useEffect(() => {
    Object.keys(visibleLayers).forEach((layerId) => {
      const layer = getLayerById(layerId as LayerId);
      layer?.setVisible(visibleLayers[layerId as LayerId]);
    });
  }, [visibleLayers]);

  return { visibleLayers, dispatch };
};

export default useVisibleLayers;

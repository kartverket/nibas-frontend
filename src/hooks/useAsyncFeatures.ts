import { useState, useEffect } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { LayerId } from "./layers/types";
import { addEditedFeaturesToSource, addFeaturesToSource } from "utils/map/source";
import { getAllVisibleFeatures, zoomToFeatures } from "utils/map/map-utils";

/**
 * Hook for å sette features som kommer async inn i en layer sin source. Venter til features
 * @param features Featurene som skal legges til når de har blitt hentet, de er null frem til dette
 * @returns Funksjon for å sette hvilken source featurene skal legges i
 */
const useAsyncFeatures = (
  features: Feature<Geometry>[] | null,
  zoomMode: "edit" | "view" | "none",
  callback?: () => void,
) => {
  const [layerToAddTo, setLayerToAddTo] = useState<LayerId | null>(null);

  // sett features inn i layer når features har blitt hentet
  useEffect(() => {
    if (!layerToAddTo || !features) return;

    // Om man skal legge til edit eller arhived layer så legger vi til i begge, og deler de opp basert på om feature er arkivert
    if (layerToAddTo === "edit" || layerToAddTo === "archived") {
      addEditedFeaturesToSource(features, callback);
    } else {
      addFeaturesToSource(layerToAddTo, features, callback);
    }

    if (zoomMode === "edit") {
      zoomToFeatures(features);
    }

    if (zoomMode === "view") {
      zoomToFeatures(getAllVisibleFeatures());
    }

    setLayerToAddTo(null);
  }, [layerToAddTo, features, callback, zoomMode]);

  return { addFeaturesToLayer: setLayerToAddTo };
};

export default useAsyncFeatures;

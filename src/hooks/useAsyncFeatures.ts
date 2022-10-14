import { useState, useEffect } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { LayerId } from "./layers/types";
import { addFeaturesToSource } from "utils/map/source";
import { zoomToFeatures } from "utils/map";
import { ObjectValue } from "contexts/EditGrenserContext";

/**
 * Hook for å sette features som kommer async inn i en layer sin source. Venter til features
 * @param features Featurene som skal legges til når de har blitt hentet, de er null frem til dette
 * @returns Funksjon for å sette hvilken source featurene skal legges i
 */
const useAsyncFeatures = (
  features: Feature<Geometry>[] | null,
  objectValue: ObjectValue
) => {
  const [layerToAddTo, setLayerToAddTo] = useState<LayerId | null>(null);

  // sett features inn i layer når features har blitt hentet
  useEffect(() => {
    if (!layerToAddTo || !features) return;

    addFeaturesToSource(layerToAddTo, features);
    setLayerToAddTo(null);

    if (objectValue?.editing) {
      zoomToFeatures(features);
    }
  }, [layerToAddTo, features, objectValue?.editing]);

  return setLayerToAddTo;
};

export default useAsyncFeatures;

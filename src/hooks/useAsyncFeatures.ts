import { useState, useEffect } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { LayerId } from "./layers/types";
import { addFeaturesToSource } from "utils/map/source";
import { getAllVisibleFeatures, zoomToFeatures } from "utils/map";

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

        addFeaturesToSource(layerToAddTo, features, callback);
        setLayerToAddTo(null);

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

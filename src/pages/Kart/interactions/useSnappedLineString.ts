import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { Modify } from "ol/interaction";
import { ModifyEvent } from "ol/interaction/Modify";
import { useEffect, useState } from "react";
import { isLineStringFeature } from "utils/type-utils";
import { map } from "../constants";

export const useSnappedLineString = (modify: Modify) => {
  const [modifiedLineString, setModifiedLineString] = useState<Feature<Geometry> | null>(null);

  useEffect(() => {
    const saveModifiedLineString = (e: ModifyEvent) => {
      const modifiedFeatures = [...e.features.getArray()].filter((f) => isLineStringFeature(f));
      if (modifiedFeatures.length === 1) {
        setModifiedLineString(modifiedFeatures[0]);
      } else {
        setModifiedLineString(null);
      }
    };

    const storeSnappedData = (e: ModifyEvent) => {
      if (modifiedLineString != null) {
        const featuresAtEndPixel = map
          .getFeaturesAtPixel(e.mapBrowserEvent.pixel)
          .filter((f) => isLineStringFeature(f) && f.getId() !== modifiedLineString.getId());
        if (featuresAtEndPixel.length > 0) {
          const snappedFeature = featuresAtEndPixel[0];
          modifiedLineString.set("worstNoeyaktighetSnappedTo", 0);
          console.log(modifiedLineString);
        }
      }
    };

    modify.on("modifystart", saveModifiedLineString);
    modify.on("modifyend", storeSnappedData);

    return () => {
      modify.un("modifystart", saveModifiedLineString);
      modify.un("modifyend", storeSnappedData);
    };
  }, [modifiedLineString, modify]);
};

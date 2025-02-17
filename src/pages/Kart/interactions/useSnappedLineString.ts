import { Feature } from "ol";
import { FeatureLike } from "ol/Feature";
import { Geometry } from "ol/geom";
import { Modify } from "ol/interaction";
import { ModifyEvent } from "ol/interaction/Modify";
import { useEffect, useState } from "react";
import { isLineStringFeature, isPointFeature } from "utils/type-utils";
import { map } from "../constants";

export const useSnappedLineString = (
  modify: Modify,
  onSnap: (
    e: ModifyEvent,
    actingLineString: Feature<Geometry>,
    targetLineString: FeatureLike,
    point: FeatureLike,
  ) => void,
) => {
  const [currentlyModifyingLineString, setCurrentlyModifyingLineString] = useState<Feature<Geometry> | null>(null);

  useEffect(() => {
    const saveCurrentlyModifiyingLineString = (e: ModifyEvent) => {
      const modifiedLineString = [...e.features.getArray()].filter((f) => isLineStringFeature(f));
      if (modifiedLineString.length === 1) {
        setCurrentlyModifyingLineString(modifiedLineString[0]);
      } else {
        setCurrentlyModifyingLineString(null);
      }
    };

    const onPotentialSnap = (e: ModifyEvent) => {
      if (currentlyModifyingLineString != null) {
        const featuresAtEndPixel = map
          .getFeaturesAtPixel(e.mapBrowserEvent.pixel)
          .filter((f) => f.getId() !== currentlyModifyingLineString.getId());
        const lineStringFeaturesAtEndPixel = featuresAtEndPixel.filter((f) => isLineStringFeature(f));
        const pointFeaturesAtEndPixel = featuresAtEndPixel.filter((f) => isPointFeature(f));
        if (lineStringFeaturesAtEndPixel.length > 0 && pointFeaturesAtEndPixel.length > 0) {
          const snappedFeature = lineStringFeaturesAtEndPixel[0];
          const snappedPoint = pointFeaturesAtEndPixel[0];
          onSnap(e, currentlyModifyingLineString, snappedFeature, snappedPoint);
        }
      }
    };

    modify.on("modifystart", saveCurrentlyModifiyingLineString);
    modify.on("modifyend", onPotentialSnap);

    return () => {
      modify.un("modifystart", saveCurrentlyModifiyingLineString);
      modify.un("modifyend", onPotentialSnap);
    };
  }, [currentlyModifyingLineString, modify, onSnap]);
};

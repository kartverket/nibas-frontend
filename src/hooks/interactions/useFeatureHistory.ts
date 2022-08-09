import { useEffect, useMemo, useState } from "react";
import LineString from "ol/geom/LineString";
import { ModifyEvent } from "ol/interaction/Modify";
import { modify } from "./constants";
import { editSource } from "hooks/layers/constants";
import { editStyles } from "utils/map/layerStyles";

// liste med koordinater, hvor 0 er eldst og n er nyeste versjon
type FeatureHistory = Record<string, number[][][]>;

const useFeatureHistory = () => {
  const [history, setHistory] = useState<FeatureHistory>({});

  useEffect(() => {
    const addInitialFeaturesToHistory = (e: ModifyEvent) => {
      e.features.forEach((featureLike) => {
        const featureId = featureLike.getId();

        if (!featureId) return;

        setHistory((prevHistory) => {
          if (prevHistory[featureId]?.length > 0) return prevHistory;

          const geometry = featureLike.getGeometry() as LineString;
          const initialCoordinates = geometry.getCoordinates();

          if (!initialCoordinates) return prevHistory;

          return {
            [featureId]: [initialCoordinates],
          };
        });
      });
    };

    modify.on("modifystart", addInitialFeaturesToHistory);
  }, []);

  useEffect(() => {
    const addCoordinatesToHistory = (e: ModifyEvent) => {
      e.features.forEach((featureLike) => {
        const featureId = featureLike.getId();

        if (!featureId) return;

        const geometry = featureLike.getGeometry() as LineString;
        const newCoordinates = geometry.getCoordinates();

        if (!newCoordinates) return;

        setHistory((prevHistory) => ({
          ...prevHistory,
          [featureId]: [...prevHistory[featureId], newCoordinates],
        }));
      });
    };

    modify.on("modifyend", addCoordinatesToHistory);
  }, []);

  useEffect(() => {
    console.log(history);
  }, [history]);

  const dirtyFeatureIds = useMemo(() => Object.keys(history), [history]);

  const clearHistory = () => {
    Object.keys(history).forEach((featureId) => {
      editSource.getFeatureById(featureId).setStyle(editStyles);
    });

    setHistory({});
  };

  return {
    dirtyFeatureIds,
    clearHistory,
  };
};

export default useFeatureHistory;

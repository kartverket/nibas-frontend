import { useEffect, useMemo, useState } from "react";
import LineString from "ol/geom/LineString";
import { ModifyEvent } from "ol/interaction/Modify";
import { modify } from "./constants";
import { editSource } from "hooks/layers/constants";
import { editStyles } from "utils/map/layerStyles";

// liste med features og deres nye koordinater per endring,
// hvor 0 er eldst og n er nyeste versjon
/*
[
  {
    feature123: [[1, 2], [2, 5]]
  },
  {
    feature123: [[1, 2], [4, 8]],
    feature456: [[5, 6], [-1, 5]]
  }
]
*/
type FeatureHistory = Record<string, number[][]>[];

const useFeatureHistory = () => {
  const [history, setHistory] = useState<FeatureHistory>([]);
  const [index, setIndex] = useState(0);

  const dirtyFeatureIds = useMemo(
    () =>
      history.reduce<string[]>((accumulator, entry, currentIndex) => {
        // dirty features avhenger av hvilken index vi er på for å vise
        // de nåværende endrede featurene
        if (currentIndex >= index) return accumulator;

        const featureIdsChangedInIteration = Object.keys(entry);

        featureIdsChangedInIteration.forEach((featureId) => {
          if (!accumulator.includes(featureId)) {
            accumulator.push(featureId);
          }
        });

        return accumulator;
      }, []),
    [history, index]
  );

  useEffect(() => {
    const addCurrentCoordinatesToHistory = (e: ModifyEvent) => {
      e.features.forEach((featureLike) => {
        const featureId = featureLike.getId();

        if (!featureId) return;

        setHistory((prevHistory) => {
          const geometry = featureLike.getGeometry() as LineString;
          const initialCoordinates = geometry.getCoordinates();

          if (!initialCoordinates) return prevHistory;

          return [
            ...prevHistory,
            {
              [featureId]: initialCoordinates,
            },
          ];
        });
      });
    };

    modify.on("modifystart", addCurrentCoordinatesToHistory);

    return () => {
      modify.un("modifystart", addCurrentCoordinatesToHistory);
    };
  }, []);

  useEffect(() => {
    console.log("Current index", index);
  }, [index]);

  useEffect(() => {
    console.log(history);
    if (history.length === 0) return;

    setIndex(history.length);
  }, [history]);

  const clearHistory = () => {
    dirtyFeatureIds.forEach((featureId) => {
      editSource.getFeatureById(featureId).setStyle(editStyles);
    });

    setHistory([]);
  };

  const undo = () => {
    if (index === 0 || history.length === 0) return;

    const newIndex = index - 1;
    setIndex(newIndex);

    console.log("New index", newIndex);

    for (let i = history.length - 1; i >= newIndex; i--) {
      console.log("i", i);
      const entry = history[i];
      console.log("entry", entry);

      Object.keys(entry).forEach((featureId) => {
        const lineString = editSource
          .getFeatureById(featureId)
          .getGeometry() as LineString;
        lineString.setCoordinates(entry[featureId]);
      });
    }
  };

  return {
    dirtyFeatureIds,
    clearHistory,
    undo,
  };
};

export default useFeatureHistory;

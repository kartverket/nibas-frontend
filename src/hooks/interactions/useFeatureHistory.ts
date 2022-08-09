import { useEffect, useMemo, useState } from "react";
import LineString from "ol/geom/LineString";
import { ModifyEvent } from "ol/interaction/Modify";
import { modify } from "./constants";
import { editSource } from "hooks/layers/constants";
import { editStyles } from "utils/map/layerStyles";
import { Coordinate } from "ol/coordinate";

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
// en entry har en før og en etter koordinatliste
type Entry = Record<string, Coordinate[]>;
type Entries = Entry[];
type FeatureHistory = {
  index: number;
  entries: Entries;
};

const setFeatureCoordinatesForEntry = (entry: Entry) => {
  Object.keys(entry).forEach((featureId) => {
    const lineString = editSource
      .getFeatureById(featureId)
      .getGeometry() as LineString;

    lineString.setCoordinates(entry[featureId]);
  });
};

const useFeatureHistory = () => {
  const [history, setHistory] = useState<FeatureHistory>({
    index: 0,
    entries: [],
  });

  const dirtyFeatureIds = useMemo(
    () =>
      history.entries.reduce<string[]>((accumulator, entry, currentIndex) => {
        // dirty features avhenger av hvilken index vi er på for å vise
        // de nåværende endrede featurene
        if (currentIndex >= history.index) return accumulator;

        const featureIdsChangedInIteration = Object.keys(entry);

        featureIdsChangedInIteration.forEach((featureId) => {
          if (!accumulator.includes(featureId)) {
            accumulator.push(featureId);
          }
        });

        return accumulator;
      }, []),
    [history]
  );

  useEffect(() => {
    const addCurrentCoordinatesToHistory = (e: ModifyEvent) => {
      const newEntries: Record<string, number[][]> = {};

      e.features.forEach((featureLike) => {
        const featureId = featureLike.getId();

        if (!featureId) return;

        const geometry = featureLike.getGeometry() as LineString;
        const initialCoordinates = geometry.getCoordinates();

        if (!initialCoordinates) return;

        newEntries[featureId] = initialCoordinates;
        console.log("New entries", newEntries);
      });

      setHistory((prevHistory) => {
        const newIndex = prevHistory.index + 1;
        const historyUpToIndex = prevHistory.entries.slice(0, newIndex);

        console.log("History up to index", historyUpToIndex);
        return {
          index: newIndex,
          entries: [...historyUpToIndex, newEntries],
        };
      });
    };

    modify.on("modifystart", addCurrentCoordinatesToHistory);

    return () => {
      modify.un("modifystart", addCurrentCoordinatesToHistory);
    };
  }, []);

  const clearHistory = () => {
    dirtyFeatureIds.forEach((featureId) => {
      editSource.getFeatureById(featureId).setStyle(editStyles);
    });

    setHistory({
      entries: [],
      index: 0,
    });
  };

  useEffect(() => {
    console.log(history);
  }, [history]);

  const undo = () => {
    const { index } = history;
    const entries = history.entries.slice();

    if (index === 0 || entries.length === 0) return;

    if (index === entries.length) {
      // hvis første undo, legg til features sånn de ser ut nå i history
      const newEntries: Record<string, number[][]> = {};
      dirtyFeatureIds.forEach((featureId) => {
        const lineString = editSource
          .getFeatureById(featureId)
          .getGeometry() as LineString;

        newEntries[featureId] = lineString.getCoordinates();
      });

      entries.push(newEntries);
    }

    const newIndex = index - 1;

    console.log("New index", newIndex);

    for (let i = history.entries.length - 1; i >= newIndex; i--) {
      console.log("i", i);
      const entry = history.entries[i];
      setFeatureCoordinatesForEntry(entry);
    }

    setHistory({
      entries,
      index: newIndex,
    });
  };

  const redo = () => {
    const { index, entries } = history;

    if (index >= entries.length) return;

    console.log("Current index before redo", index);

    const newIndex = index + 1;

    for (let i = index; i < newIndex; i++) {
      console.log("i", i);
      const entry = history.entries[i];
      console.log("Entry to apply", entry);
      setFeatureCoordinatesForEntry(entry);
    }

    setHistory({
      entries,
      index: newIndex,
    });
  };

  return {
    dirtyFeatureIds,
    clearHistory,
    undo,
    redo,
  };
};

export default useFeatureHistory;

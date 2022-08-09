import { useEffect, useMemo, useState } from "react";
import { Coordinate } from "ol/coordinate";
import { FeatureLike } from "ol/Feature";
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
// en entry har en før og en etter koordinatliste
// om andre elementet er null har det ikke en etter-state, som vil si den fortsatt dragges
type BeforeAfterCoordinates = [Coordinate[], Coordinate[] | null];
type Entry = Record<string, BeforeAfterCoordinates>;
type Entries = Entry[];
type FeatureHistory = {
  index: number;
  entries: Entries;
};

const setFeatureCoordinatesForEntry = (
  entry: Entry,
  direction: "from" | "to"
) => {
  Object.keys(entry).forEach((featureId) => {
    const lineString = editSource
      .getFeatureById(featureId)
      .getGeometry() as LineString;

    const coordinates = entry[featureId][direction === "from" ? 0 : 1];

    if (!coordinates) return;

    lineString.setCoordinates(coordinates);
  });
};

const getInfoFromFeature = (featureLike: FeatureLike) => {
  const featureId = featureLike.getId();
  const geometry = featureLike.getGeometry() as LineString;

  return { coordinates: geometry.getCoordinates(), featureId };
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
        if (history.index === 0 || currentIndex >= history.index)
          return accumulator;

        const featureIdsChangedInEntry = Object.keys(entry);

        featureIdsChangedInEntry.forEach((featureId) => {
          // hvis to-koordinatene ikke er satt er ikke featuren dirty enda
          if (
            entry[featureId][1] !== null &&
            !accumulator.includes(featureId)
          ) {
            accumulator.push(featureId);
          }
        });

        return accumulator;
      }, []),
    [history]
  );

  useEffect(() => {
    const addCurrentCoordinatesToHistory = (e: ModifyEvent) => {
      const newEntry: Entry = {};

      e.features.forEach((featureLike) => {
        const { featureId, coordinates } = getInfoFromFeature(featureLike);

        if (!featureId || !coordinates) return;

        newEntry[featureId] = [coordinates, null];
      });

      setHistory((prevHistory) => {
        const newIndex = prevHistory.index + 1;
        const historyUpToIndex = prevHistory.entries.slice(
          0,
          prevHistory.index
        );

        return {
          index: newIndex,
          entries: [...historyUpToIndex, newEntry],
        };
      });
    };

    modify.on("modifystart", addCurrentCoordinatesToHistory);
  }, []);

  useEffect(() => {
    const updateToCoordinate = (e: ModifyEvent) => {
      e.features.forEach((featureLike) => {
        const { featureId, coordinates } = getInfoFromFeature(featureLike);

        if (!featureId || !coordinates) return;

        setHistory((prevHistory) => {
          const newEntries = prevHistory.entries.slice();
          const newestEntry = newEntries[prevHistory.index - 1];
          const featureCoordinates = newestEntry[featureId][0];
          newestEntry[featureId] = [featureCoordinates, coordinates];

          return {
            index: prevHistory.index,
            entries: newEntries,
          };
        });
      });
    };

    modify.on("modifyend", updateToCoordinate);
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

  const undo = () => {
    const { index } = history;
    const entries = history.entries.slice();

    if (index === 0 || entries.length === 0) return;

    const newIndex = index - 1;

    for (let i = newIndex; i > newIndex - 1; i--) {
      const entry = history.entries[i];
      setFeatureCoordinatesForEntry(entry, "from");
    }

    setHistory({
      entries,
      index: newIndex,
    });
  };

  const redo = () => {
    const { index, entries } = history;

    if (index >= entries.length) return;

    const newIndex = index + 1;

    for (let i = index; i < newIndex; i++) {
      const entry = history.entries[i];
      setFeatureCoordinatesForEntry(entry, "to");
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

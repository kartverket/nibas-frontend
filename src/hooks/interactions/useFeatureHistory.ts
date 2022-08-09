import { useEffect, useMemo, useState } from "react";
import LineString from "ol/geom/LineString";
import { ModifyEvent } from "ol/interaction/Modify";
import { modify } from "./constants";
import { editSource } from "hooks/layers/constants";
import { editStyles } from "utils/map/layerStyles";
import { Coordinate } from "ol/coordinate";
import { FeatureLike } from "ol/Feature";

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
        if (history.index === 0) return accumulator;
        // dirty features avhenger av hvilken index vi er på for å vise
        // de nåværende endrede featurene
        if (currentIndex >= history.index) return accumulator;

        const featureIdsChangedInIteration = Object.keys(entry);

        featureIdsChangedInIteration.forEach((featureId) => {
          if (entry[featureId][1] === null) {
            return accumulator;
          }

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
      const newEntry: Entry = {};

      e.features.forEach((featureLike) => {
        const { featureId, coordinates } = getInfoFromFeature(featureLike);

        if (!featureId || !coordinates) return;

        newEntry[featureId] = [coordinates, null];
        console.log("New entries", newEntry);
      });

      setHistory((prevHistory) => {
        const newIndex = prevHistory.index + 1;
        const historyUpToIndex = prevHistory.entries.slice(
          0,
          prevHistory.index
        );

        console.log("History up to index", historyUpToIndex);
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
          console.log("prev history in modifyend", prevHistory);
          const newEntries = prevHistory.entries.slice();
          const newestEntry = newEntries[prevHistory.index - 1];
          console.log("Newest entry", newestEntry);
          const featureCoordinates = newestEntry[featureId][0];
          newestEntry[featureId] = [featureCoordinates, coordinates];

          console.log("New entries on modifyend", newEntries);
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

  useEffect(() => {
    console.log(history);
  }, [history]);

  const undo = () => {
    const { index } = history;
    const entries = history.entries.slice();

    if (index === 0 || entries.length === 0) return;

    const newIndex = index - 1;

    console.log("New index", newIndex);

    for (let i = newIndex; i > newIndex - 1; i--) {
      console.log("i", i);
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

    console.log("Current index before redo", index);

    const newIndex = index + 1;

    for (let i = index; i < newIndex; i++) {
      console.log("i", i);
      const entry = history.entries[i];
      console.log("Entry to apply", entry);
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

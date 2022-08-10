import { useEffect, useMemo, useState } from "react";
import { Coordinate } from "ol/coordinate";
import { FeatureLike } from "ol/Feature";
import LineString from "ol/geom/LineString";
import { ModifyEvent } from "ol/interaction/Modify";
import { modify } from "./constants";
import { editSource } from "hooks/layers/constants";

// liste med features og deres nye koordinater per endring,
// hvor 0 er eldst og n er nyeste versjon
/*
[
  {
    // fra [[1, 2], [2, 5]], til [[0, 0], [2, 5]]
    feature123: [[[1, 2], [2, 5]], [[0, 0], [2, 5]]]
  },
  {
    // disse har begynt å dragges, men ikke er sluppet enda
    feature123: [[[1, 2], [4, 8]], null],
    feature456: [[[5, 6], [-1, 5]], null]
  }
]
*/
// en entry har en før og en etter koordinatliste
// om andre elementet er null har det ikke en etter-state, som vil si den fortsatt dragges
type BeforeAfterCoordinates = [Coordinate[], Coordinate[] | null];
type Entry = Record<string, BeforeAfterCoordinates>;
type FeatureHistory = {
  index: number;
  entries: Entry[];
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
      history.entries
        .slice(0, history.index)
        .reduce<string[]>((accumulator, entry) => {
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

      // når ny entry legges til, forsikre om at den tar kun opp til index
      // da kan vi lage ny historie hvis vi har gått tilbake i tid tidligere
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
    setHistory({
      entries: [],
      index: 0,
    });
  };

  const revert = (amount: number) => {
    const { index, entries } = history;

    if (index === 0 || entries.length === 0) return;

    const newIndex = index - (amount > index ? index : amount);

    // gå bakover til nye indexen og sett koordinater for alle features
    // frem til nye index
    for (let i = newIndex; i > newIndex - 1; i--) {
      setFeatureCoordinatesForEntry(history.entries[i], "from");
    }

    setHistory({
      entries,
      index: newIndex,
    });
  };

  const reapply = (amount: number) => {
    const { index, entries } = history;

    if (index >= entries.length) return;

    const newIndex =
      index + amount > entries.length ? entries.length : index + amount;

    for (let i = index; i < newIndex; i++) {
      setFeatureCoordinatesForEntry(history.entries[i], "to");
    }

    setHistory({
      entries,
      index: newIndex,
    });
  };

  const undo = () => {
    revert(1);
  };

  const redo = () => {
    reapply(1);
  };

  const canRedo = history.index < history.entries.length;

  return {
    dirtyFeatureIds,
    clearHistory,
    undo,
    redo,
    canRedo,
  };
};

export default useFeatureHistory;

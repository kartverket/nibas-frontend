import { useEffect, useMemo } from "react";
import { Coordinate } from "ol/coordinate";
import Feature, { FeatureLike } from "ol/Feature";
import LineString from "ol/geom/LineString";
import { ModifyEvent } from "ol/interaction/Modify";
import { modify } from "./constants";
import { useToolbarSave } from "contexts/ToolbarContext";
import { editSource } from "hooks/layers/constants";
import useHistory, { HistoryEntry } from "hooks/useHistory";
import { getLayerById } from "utils/map/layers";

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

const setFeatureCoordinatesForEntry = (
  entry: HistoryEntry<BeforeAfterCoordinates>,
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

const onUndo = (entry: HistoryEntry<BeforeAfterCoordinates>) => {
  setFeatureCoordinatesForEntry(entry, "from");
};
const onRedo = (entry: HistoryEntry<BeforeAfterCoordinates>) => {
  setFeatureCoordinatesForEntry(entry, "to");
};

const getInfoFromFeature = (featureLike: FeatureLike) => {
  const featureId = featureLike.getId();
  const geometry = featureLike.getGeometry() as LineString;

  return { coordinates: geometry.getCoordinates(), featureId };
};

const useFeatureHistory = () => {
  const { clearHistory, history, redo, setHistory, undo } = useHistory({
    onRedo,
    onUndo,
  });

  const { updateDraft } = useToolbarSave("grense");

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
      const newEntry: HistoryEntry<BeforeAfterCoordinates> = {};

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

        historyUpToIndex.push(newEntry);

        return {
          index: newIndex,
          entries: historyUpToIndex,
        };
      });
    };

    modify.on("modifystart", addCurrentCoordinatesToHistory);
  }, [setHistory]);

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

        const feature = getLayerById("edit")
          .getSource()
          .getFeatureById(featureId);
        updateDraft(featureId as string, feature as Feature<LineString>);
      });
    };

    modify.on("modifyend", updateToCoordinate);
  }, [updateDraft, setHistory]);

  return {
    dirtyFeatureIds,
    clearHistory,
    undo: history.entries.length > 0 && history.index > 0 ? undo : undefined,
    redo: history.index < history.entries.length ? redo : undefined,
  };
};

export default useFeatureHistory;

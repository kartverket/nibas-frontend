import { useEffect } from "react";
import { Snap } from "ol/interaction";
import { modify } from "./constants";
import useDirtyStyles from "./useDirtyStyles";
import { map } from "components/Kart/constants";
import { getVectorLayers } from "utils/map/layers";
import {
  GrenseEntry,
  BaseHistoryEntry,
  useToolbar,
  useToolbarSave,
} from "contexts/ToolbarContext";
import { ModifyEvent } from "ol/interaction/Modify";
import { FeatureLike } from "ol/Feature";
import LineString from "ol/geom/LineString";

const getInfoFromFeature = (featureLike: FeatureLike) => {
  const featureId = featureLike.getId();
  const geometry = featureLike.getGeometry() as LineString;

  return { coordinates: geometry.getCoordinates(), featureId };
};

const useEditInteractions = () => {
  const { dirtyFeatureIds, addEntry, updateEntry, history } =
    useToolbarSave("grense");

  useDirtyStyles(dirtyFeatureIds);

  useEffect(() => {
    const vectorLayers = getVectorLayers();
    const snaps: Snap[] = [];

    vectorLayers.forEach((layer) => {
      const source = layer.getSource();

      const snap = new Snap({ source });

      snaps.push(snap);
    });

    map.addInteraction(modify);
    // snaps må legges til etter modify og draw interactions
    snaps.forEach((snap) => {
      map.addInteraction(snap);
    });

    return () => {
      map.removeInteraction(modify);
      snaps.forEach((snap) => {
        map.removeInteraction(snap);
      });
    };
  }, []);

  useEffect(() => {
    const addCurrentCoordinatesToHistory = (e: ModifyEvent) => {
      console.log("Running modifu start");
      const newEntry: GrenseEntry = {
        type: "grense",
        changes: [],
      };

      e.features.forEach((featureLike) => {
        const { featureId, coordinates } = getInfoFromFeature(featureLike);

        if (!featureId || !coordinates) return;

        newEntry.changes.push({
          id: featureId as string,
          from: coordinates,
          to: null,
        });
      });

      addEntry(newEntry);
    };

    modify.on("modifystart", addCurrentCoordinatesToHistory);

    return () => {
      modify.un("modifystart", addCurrentCoordinatesToHistory);
    };
  }, [addEntry]);

  useEffect(() => {
    const updateToCoordinate = (e: ModifyEvent) => {
      console.log("Updating coordinate");
      // legger til riktig type entry i modifystart, så dette skal være safe
      const previousEntry = history.entries[history.index - 1] as GrenseEntry;

      e.features.forEach((featureLike) => {
        const { featureId, coordinates } = getInfoFromFeature(featureLike);

        if (!featureId || !coordinates) return;

        updateEntry(history.index - 1, {
          ...previousEntry,
          changes: previousEntry.changes.map((entry) => {
            if (entry.id === featureId && entry.to === null) {
              entry.to = coordinates;
            }

            return entry;
          }),
        });
      });
    };

    modify.on("modifyend", updateToCoordinate);

    return () => {
      modify.un("modifyend", updateToCoordinate);
    };
  }, [history, updateEntry]);
};

export default useEditInteractions;

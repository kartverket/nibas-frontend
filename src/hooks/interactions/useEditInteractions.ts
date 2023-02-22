import { useEffect, useMemo } from "react";
import { FeatureLike } from "ol/Feature";
import LineString from "ol/geom/LineString";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import {
  GrenseEntry,
  useToolbar,
  useToolbarSaving,
} from "contexts/ToolbarContext";
import { click } from "ol/events/condition";
import { Collection } from "ol";
import { editableBorderTypes, editSource } from "hooks/layers/constants";
import useSelectInteraction from "./useSelectInteraction";
import { pixelTolerance } from "./constants";
import { getLayerById } from "utils/map/layers";
import { map } from "components/Kart/constants";

const getInfoFromFeature = (featureLike: FeatureLike) => {
  const featureId = featureLike.getId();
  const geometry = featureLike.getGeometry() as LineString;
  return { coordinates: geometry.getCoordinates(), featureId };
};

const useEditInteractions = () => {
  const { addEntry, updateEntry, history } = useToolbarSaving();
  const { activePointMode } = useToolbar();
  const detachIsActive = activePointMode === "detach";
  const { selectedFeatures } = useSelectInteraction();
  const editLayer = getLayerById("edit");

  const modify = useMemo(
    () =>
      new Modify({
        source: detachIsActive ? undefined : editSource,
        features: detachIsActive ? new Collection(selectedFeatures) : undefined,
        pixelTolerance: pixelTolerance,
        condition: (mapBrowserEvent) => {
          const featuresAtPixel = map.getFeaturesAtPixel(
            mapBrowserEvent.pixel,
            {
              layerFilter: (layer) => layer === editLayer,
              hitTolerance: 20,
            }
          );
          const feature = featuresAtPixel[0];
          if (feature) {
            return editableBorderTypes.includes(feature.get("type"));
          }

          return true;
        },
        insertVertexCondition: () => {
          return activePointMode === "add";
        },
        deleteCondition: (mapBrowserEvent) => {
          return activePointMode === "remove" && click(mapBrowserEvent);
        },
      }),
    [activePointMode, detachIsActive, editLayer, selectedFeatures]
  );

  useEffect(() => {
    const addCurrentCoordinatesToHistory = (e: ModifyEvent) => {
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
  }, [addEntry, modify]);

  useEffect(() => {
    const updateToCoordinate = (e: ModifyEvent) => {
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
  }, [history, updateEntry, modify]);

  return { modify };
};

export default useEditInteractions;

import { useEffect, useMemo } from "react";
import Feature, { FeatureLike } from "ol/Feature";
import LineString from "ol/geom/LineString";
import { Snap } from "ol/interaction";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import useDirtyStyles from "./useDirtyStyles";
import { map } from "components/Kart/constants";
import {
  GrenseEntry,
  useToolbar,
  useToolbarSaving,
} from "contexts/ToolbarContext";
import { getLayerById, getVectorLayers } from "utils/map/layers";
import Style from "ol/style/Style";
import { click } from "ol/events/condition";
import { Collection, MapBrowserEvent } from "ol";
import Geometry from "ol/geom/Geometry";
import { editSource } from "hooks/layers/constants";

const getInfoFromFeature = (featureLike: FeatureLike) => {
  const featureId = featureLike.getId();
  const geometry = featureLike.getGeometry() as LineString;

  return { coordinates: geometry.getCoordinates(), featureId };
};

const useEditInteractions = () => {
  const { dirtyFeatureIds, addEntry, updateEntry, history } =
    useToolbarSaving();

  const { activePointMode, activeEditModes } = useToolbar();

  const collection = useMemo(() => new Collection<Feature<Geometry>>(), []);
  const detachIsActive = activeEditModes.includes("detach");

  const modify = useMemo(
    () =>
      new Modify({
        source: detachIsActive ? undefined : editSource,
        features: detachIsActive ? collection : undefined,
        style: new Style({}), // TODO: bør kanskje fjernes for UX, gir en indikator på hva man velger
        insertVertexCondition: () => {
          return activePointMode === "add";
        },
        deleteCondition: (mapBrowserEvent) => {
          return activePointMode === "remove" && click(mapBrowserEvent);
        },
      }),
    [activePointMode, collection, detachIsActive]
  );

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
    if (activeEditModes.includes("snap")) {
      snaps.forEach((snap) => {
        map.addInteraction(snap);
      });
    }

    const editLayer = getLayerById("edit");

    if (activeEditModes.includes("detach")) {
      map.on("pointermove", (event: MapBrowserEvent<MouseEvent>) => {
        if (!event.dragging) {
          const features = map.getFeaturesAtPixel(event.pixel, {
            layerFilter: (layer) => layer === editLayer,
          });
          if (
            features.length &&
            (collection.getLength() === 0 || collection.item(0) !== features[0])
          ) {
            if (features[0] instanceof Feature<Geometry>) {
              collection.clear();
              collection.push(features[0]);
            }
          }
        }
      });
    }

    return () => {
      map.removeInteraction(modify);
      snaps.forEach((snap) => {
        map.removeInteraction(snap);
      });
    };
  }, [activeEditModes, collection, modify]);

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
};

export default useEditInteractions;

import { useEffect, useMemo } from "react";
import Feature, { FeatureLike } from "ol/Feature";
import LineString from "ol/geom/LineString";
import { Snap } from "ol/interaction";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import { map } from "components/Kart/constants";
import {
  GrenseEntry,
  useToolbar,
  useToolbarSaving,
} from "contexts/ToolbarContext";
import { getLayerById, getVectorLayers } from "utils/map/layers";
import { click } from "ol/events/condition";
import { Collection, MapBrowserEvent } from "ol";
import Geometry from "ol/geom/Geometry";
import { editSource } from "hooks/layers/constants";
import { squaredDistance } from "ol/coordinate";
import { addFeaturesToSource } from "utils/map/source";
import useSelectInteraction from "./useSelectInteraction";

const getInfoFromFeature = (featureLike: FeatureLike) => {
  const featureId = featureLike.getId();
  const geometry = featureLike.getGeometry() as LineString;

  return { coordinates: geometry.getCoordinates(), featureId };
};

const useEditInteractions = () => {
  const { addEntry, updateEntry, history } = useToolbarSaving();
  const { activePointMode, activeEditModes } = useToolbar();
  const detachIsActive = activeEditModes.includes("detach");
  const { selectedFeatures } = useSelectInteraction();

  const modify = useMemo(
    () =>
      new Modify({
        source: detachIsActive ? undefined : editSource,
        features: detachIsActive ? new Collection(selectedFeatures) : undefined,
        insertVertexCondition: () => {
          return activePointMode === "add";
        },
        deleteCondition: (mapBrowserEvent) => {
          return activePointMode === "remove" && click(mapBrowserEvent);
        },
        pixelTolerance: 20,
      }),
    [activePointMode, detachIsActive, selectedFeatures]
  );

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

    return () => {
      map.removeInteraction(modify);
      snaps.forEach((snap) => {
        map.removeInteraction(snap);
      });
    };
  }, [activeEditModes, modify]);

  useEffect(() => {
    const splitFeature = (event: MapBrowserEvent<MouseEvent>) => {
      if (activePointMode === "split" && !event.dragging) {
        // Stopper propagering for å unngå selection når man skal splitte
        event.stopPropagation();

        const editLayer = getLayerById("edit");
        const features = map.getFeaturesAtPixel(event.pixel, {
          layerFilter: (layer) => layer === editLayer,
          hitTolerance: 20,
        });
        // Forutsetter at man bare trykker på én feature
        const feature = features[0];
        if (feature instanceof Feature<Geometry>) {
          const geometry = feature.getGeometry() as LineString;
          const coordinates = geometry.getCoordinates();

          // Siden OL-objekter er mutable og vi trenger dette til senere:
          const originalCoordinates = [...coordinates];

          // Ikke vits å gjøre splitting med mindre du har en linje med minst tre punkter
          if (coordinates.length > 2) {
            const coordinatesWithDistance = coordinates.map((coord) => [
              ...coord,
              squaredDistance(coord, event.coordinate),
            ]);
            const nearestVertex = coordinatesWithDistance
              .sort((a, b) => a[2] - b[2])
              .map((cwd) => cwd.slice(0, -1))[0];

            const nearestVertexIndex = coordinates.findIndex(
              (v) => v[0] === nearestVertex[0] && v[1] === nearestVertex[1]
            );

            // TODO: clone er trolig overivrig, må gå gjennom alle properties for å se hva som skal endres
            const clonedFeature = feature.clone();
            const clonedGeometry = clonedFeature.getGeometry() as LineString;
            const clonedCoordinates = clonedGeometry.getCoordinates();
            clonedFeature.setId(`${feature.getId()}-clone`);

            const headCoordinates = coordinates.splice(
              0,
              nearestVertexIndex + 1
            );
            const tailCoordinates =
              clonedCoordinates.splice(nearestVertexIndex);

            geometry.setCoordinates(headCoordinates);
            clonedGeometry.setCoordinates(tailCoordinates);

            addFeaturesToSource("edit", [clonedFeature]);

            const featureInfo = getInfoFromFeature(feature);
            const clonedFeatureInfo = getInfoFromFeature(clonedFeature);
            if (featureInfo.featureId && clonedFeatureInfo.featureId) {
              // TODO: det kan være klonen blir sendt til utkast selv om man angret en splittelse?
              // typ må kanskje ta from og to på hele features fremfor bare koordinater
              addEntry({
                type: "grense",
                changes: [
                  {
                    id: featureInfo.featureId as string,
                    from: originalCoordinates,
                    to: featureInfo.coordinates,
                  },
                ],
              });
              addEntry({
                type: "grense",
                changes: [
                  {
                    id: clonedFeatureInfo.featureId as string,
                    from: [],
                    to: clonedFeatureInfo.coordinates,
                  },
                ],
              });
            }
          }
        }
      }
    };

    map.on("click", splitFeature);

    return () => {
      map.un("click", splitFeature);
    };
  }, [activePointMode, addEntry]);

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

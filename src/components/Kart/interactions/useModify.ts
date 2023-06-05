import { useEffect, useMemo } from "react";
import Feature, { FeatureLike } from "ol/Feature";
import LineString from "ol/geom/LineString";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import { HistoryChange, useHistory } from "contexts/HistoryContext";
import { click, primaryAction } from "ol/events/condition";
import { Collection } from "ol";
import { editableBorderTypes, editSource } from "hooks/layers/constants";
import { pixelTolerance } from "./constants";
import { getLayerById } from "utils/map/layers";
import { map } from "components/Kart/constants";
import { useOverlayPanel } from "contexts/OverlayPanelContext";

const getInfoFromFeature = (featureLike: FeatureLike) => {
  const featureId = featureLike.getId();
  const geometry = featureLike.getGeometry() as LineString;
  return { coordinates: geometry.getCoordinates(), featureId };
};

const useModify = () => {
  const { addEntry, activePointMode } = useHistory();
  const { selectedFeature } = useOverlayPanel();
  const detachIsActive = activePointMode === "detach";
  const editLayer = getLayerById("edit");

  const modify = useMemo(
    () =>
      new Modify({
        source: detachIsActive ? undefined : editSource,
        features: detachIsActive
          ? new Collection(selectedFeature ? [selectedFeature] : [])
          : undefined,
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

          // Hvis vi ikke har en spesiell regel bruker vi default-condition
          return primaryAction(mapBrowserEvent);
        },
        insertVertexCondition: () => {
          return activePointMode === "add";
        },
        deleteCondition: (mapBrowserEvent) => {
          return activePointMode === "remove" && click(mapBrowserEvent);
        },
      }),
    [activePointMode, detachIsActive, editLayer, selectedFeature]
  );

  const previousCoordinateKey = "previousCoordinates";

  useEffect(() => {
    const saveCoordinatesBeforeModification = (e: ModifyEvent) => {
      if (e.features) {
        e.features.forEach((featureLike) => {
          if (featureLike instanceof Feature) {
            const { featureId, coordinates } = getInfoFromFeature(featureLike);
            if (!featureId || !coordinates) return;
            featureLike.set(previousCoordinateKey, coordinates);
          }
        });
      }
    };
    modify.on("modifystart", saveCoordinatesBeforeModification);

    return () => {
      modify.un("modifystart", saveCoordinatesBeforeModification);
    };
  }, [modify]);

  useEffect(() => {
    const addModificationToHistory = (e: ModifyEvent) => {
      if (e.features) {
        const changes: HistoryChange<number[][]>[] = [];
        e.features.forEach((featureLike) => {
          if (featureLike instanceof Feature) {
            const { featureId, coordinates } = getInfoFromFeature(featureLike);
            if (!featureId || !coordinates) return;
            changes.push({
              id: featureId as string,
              from: featureLike.get(previousCoordinateKey),
              to: coordinates,
            });
            featureLike.unset(previousCoordinateKey);
          }
        });
        addEntry({
          type: "grense",
          changes,
        });
      }
    };

    modify.on("modifyend", addModificationToHistory);

    return () => {
      modify.un("modifyend", addModificationToHistory);
    };
  }, [addEntry, modify]);

  return { modify };
};

export default useModify;

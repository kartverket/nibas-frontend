import { useEffect, useMemo } from "react";
import Feature, { FeatureLike } from "ol/Feature";
import LineString from "ol/geom/LineString";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import { HistoryChange, useHistory } from "contexts/HistoryContext";
import { primaryAction, singleClick } from "ol/events/condition";
import { Collection, MapBrowserEvent } from "ol";
import { editableBorderTypes, editSource } from "hooks/layers/constants";
import { pixelTolerance } from "./constants";
import { getLayerById } from "utils/map/layers";
import { map } from "pages/Kart/constants";
import { useToolbar } from "contexts/ToolbarContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { selectedPointStyle } from "utils/map/layerStyles";
import { useToast } from "@kvib/react";
import { findNearestVertexOnFeature, isCoordinateEqual } from "utils/map";

const getInfoFromFeature = (featureLike: FeatureLike) => {
  const featureId = featureLike.getId();
  const geometry = featureLike.getGeometry() as LineString;
  return { coordinates: geometry.getCoordinates(), featureId };
};

const useModify = () => {
  const { addHistoryEntry } = useHistory();
  const { activePointMode } = useToolbar();
  const { selectedFeatures } = useFeatureStyle();
  const toast = useToast();
  const detachIsActive = activePointMode === "detach";
  const editLayer = getLayerById("edit");

  const modify = useMemo(
    () =>
      new Modify({
        source: detachIsActive ? undefined : editSource,
        features: detachIsActive ? new Collection(selectedFeatures) : undefined,
        pixelTolerance: pixelTolerance,
        condition: (event: MapBrowserEvent<MouseEvent>) => {
          const featuresAtPixel = map.getFeaturesAtPixel(event.pixel, {
            layerFilter: (layer) => layer === editLayer,
            hitTolerance: pixelTolerance,
          });

          // Sjekk alle featurene i punktet, hvis en av dem ikke skal kunne endres ønsker vi ikke å endre noe
          // Her er det fare for at vi er overivrige hvis det er flere features veldig nærme hverandre, men ikke samme punkt
          for (const feature of featuresAtPixel) {
            const featureType = feature.get("type");
            if (!editableBorderTypes.includes(featureType)) {
              return false;
            }
          }

          // Hvis vi ikke har en spesiell regel bruker vi default condition, som er primaryAction her
          return primaryAction(event);
        },
        style: selectedPointStyle,
        insertVertexCondition: () => {
          return activePointMode === "add";
        },
        deleteCondition: (event: MapBrowserEvent<MouseEvent>) => {
          if (activePointMode === "remove") {
            const featuresAtPixel = map.getFeaturesAtPixel(event.pixel, {
              layerFilter: (layer) => layer === editLayer,
              hitTolerance: pixelTolerance,
            });

            // Dersom noen av featurene vi trykker på har for få punkter skal vi ikke fjerne punktet
            for (const feature of featuresAtPixel) {
              const geometry = feature.getGeometry();
              if (geometry instanceof LineString) {
                const coordinates = geometry.getCoordinates();
                if (coordinates.length <= 2) {
                  return false;
                }

                // Finner punktet på grensen du trykket på
                const nearestVertexCoordinate = findNearestVertexOnFeature(
                  feature as Feature<LineString>,
                  event.coordinate
                );

                // Ettersom vi ikke støtter løse tråder per nå lar vi deg ikke fjerne endepunkter
                if (
                  isCoordinateEqual(nearestVertexCoordinate, coordinates[0]) ||
                  isCoordinateEqual(
                    nearestVertexCoordinate,
                    coordinates[coordinates.length - 1]
                  )
                ) {
                  // TODO: si til brukeren at dette ikke er lov
                  return false;
                }
              }
            }

            // Hvis alt ellers ser greit ut så fjernes punktet på klikk
            return singleClick(event);
          }
          return false;
        },
      }),
    [activePointMode, detachIsActive, editLayer, selectedFeatures]
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
            const geometry = featureLike.getGeometry();

            // Filtrerer ut representasjonspunkt og flate fra å bli satt inn i history
            if (geometry instanceof LineString) {
              const { featureId, coordinates } =
                getInfoFromFeature(featureLike);
              if (!featureId || !coordinates) return;
              changes.push({
                id: featureId as string,
                from: featureLike.get(previousCoordinateKey),
                to: coordinates,
              });
              featureLike.unset(previousCoordinateKey);
            }
          }
        });
        addHistoryEntry({
          type: "grense",
          changes,
        });
      }
      if (activePointMode === "add") {
        toast({ description: "Punktet ble lagt til", status: "success" });
      } else if (activePointMode === "remove") {
        toast({ description: "Punktet ble fjernet", status: "success" });
      }

      // TODO: hvis man har kjørt en detach vil vi kanskje sjekke om featuren nå er en løs tråd
    };

    modify.on("modifyend", addModificationToHistory);

    return () => {
      modify.un("modifyend", addModificationToHistory);
    };
  }, [activePointMode, addHistoryEntry, modify, toast]);

  return { modify };
};

export default useModify;

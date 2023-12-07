import { useEffect, useMemo } from "react";
import Feature, { FeatureLike } from "ol/Feature";
import LineString from "ol/geom/LineString";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import { HistoryChange, useHistory } from "contexts/HistoryContext";
import { click, primaryAction } from "ol/events/condition";
import { Collection, MapBrowserEvent } from "ol";
import { editSource } from "hooks/layers/constants";
import { pixelTolerance } from "./constants";
import { getLayerById } from "utils/map/layers";
import { map } from "pages/Kart/constants";
import { Tool, useToolbar } from "contexts/ToolbarContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { selectedPointStyle } from "utils/map/layerStyles";
import { useToast } from "@kvib/react";
import { findNearbyVertexOnFeature, isCoordinateEqual } from "utils/map";

const getInfoFromFeature = (featureLike: FeatureLike) => {
  const featureId = featureLike.getId();
  const geometry = featureLike.getGeometry() as LineString;
  return { coordinates: geometry.getCoordinates(), featureId };
};

const useModify = () => {
  const { addHistoryEntry } = useHistory();
  const { activeTool, activeModeTools } = useToolbar();
  const { selectedFeatures, featureIsEditable, featureIsArchived } =
    useFeatureStyle();
  const toast = useToast();
  const editLayer = getLayerById("edit");

  // Ønsker helst at redigering ikke skal være aktiv under enkelte verktøy
  const disallowedPointModes: Tool[] = useMemo(
    () => ["draw", "split", "metadata", "archive", "koordinater"],
    [],
  );

  const modify = useMemo(
    () =>
      new Modify({
        features: new Collection(
          (editSource.getFeaturesCollection()!.getArray() ?? []).filter(
            (feature) => {
              // Ved løsriving ønsker vi kun å kunne påvirke valgte features
              if (activeTool === "detach") {
                return selectedFeatures.some(
                  (sf) => sf.getId() === feature.getId(),
                );
              }
              // Arkiverte features skal ikke kunne modifiseres
              return !featureIsArchived(feature);
            },
          ),
        ),
        pixelTolerance: pixelTolerance,
        condition: (event: MapBrowserEvent<MouseEvent>) => {
          if (activeModeTools.includes("move")) return false;
          if (disallowedPointModes.includes(activeTool)) return false;
          if (activeTool === "detach" && selectedFeatures.length === 0)
            return false;
          const featuresAtPixel = map.getFeaturesAtPixel(event.pixel, {
            layerFilter: (layer) => layer === editLayer,
            hitTolerance: pixelTolerance,
          });

          const activeFeatures = featuresAtPixel.filter(
            (feature) => !featureIsArchived(feature),
          );

          // Sjekk alle featurene i punktet, hvis en av dem ikke skal kunne endres ønsker vi ikke å endre noe
          if (!activeFeatures.every(featureIsEditable)) {
            toast({
              status: "error",
              title: "Denne grensen er ikke redigerbar",
            });
            return false;
          }

          // Hvis vi ikke har en spesiell regel bruker vi default condition, som er primaryAction her
          return primaryAction(event);
        },
        style: selectedPointStyle,
        insertVertexCondition: () => {
          return activeTool === "add";
        },
        deleteCondition: (event: MapBrowserEvent<MouseEvent>) => {
          if (activeTool === "remove" && click(event)) {
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

                // Sjekker hvilket punkt du trykket på
                const nearbyVertexCoordinate = findNearbyVertexOnFeature(
                  feature as Feature<LineString>,
                  event.coordinate,
                );

                // Ettersom vi ikke støtter løse tråder per nå lar vi deg ikke fjerne endepunkter
                if (
                  nearbyVertexCoordinate &&
                  (isCoordinateEqual(nearbyVertexCoordinate, coordinates[0]) ||
                    isCoordinateEqual(
                      nearbyVertexCoordinate,
                      coordinates[coordinates.length - 1],
                    ))
                ) {
                  toast({
                    status: "error",
                    title: "Man kan ikke fjerne endepunkter fra en grense",
                  });
                  return false;
                }
              }
            }

            // Hvis alt ellers ser greit ut så fjernes punktet på klikk
            return true;
          }
          return false;
        },
      }),
    [
      activeModeTools,
      activeTool,
      disallowedPointModes,
      editLayer,
      featureIsArchived,
      featureIsEditable,
      selectedFeatures,
      toast,
    ],
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
      if (activeTool === "add") {
        toast({ description: "Punktet ble lagt til", status: "success" });
      } else if (activeTool === "remove") {
        toast({ description: "Punktet ble fjernet", status: "success" });
      }

      // TODO: hvis man har kjørt en detach vil vi kanskje sjekke om featuren nå er en løs tråd
    };

    modify.on("modifyend", addModificationToHistory);

    return () => {
      modify.un("modifyend", addModificationToHistory);
    };
  }, [activeTool, addHistoryEntry, modify, toast]);

  return { modify };
};

export default useModify;

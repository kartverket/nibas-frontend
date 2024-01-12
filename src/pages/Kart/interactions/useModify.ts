import { useEffect, useMemo } from "react";
import Feature, { FeatureLike } from "ol/Feature";
import LineString from "ol/geom/LineString";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import { useHistory } from "contexts/HistoryContext";
import { click, primaryAction } from "ol/events/condition";
import { Collection, MapBrowserEvent } from "ol";
import { editSource } from "hooks/layers/constants";
import { pixelTolerance, previousCoordinateKey } from "./constants";
import { getLayerById } from "utils/map/layers";
import { map } from "pages/Kart/constants";
import { Tool, useToolbar } from "contexts/ToolbarContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { selectedPointStyle } from "utils/map/layerStyles";
import { useToast } from "@kvib/react";
import { findNearbyVertexOnFeature, isCoordinateEqual } from "utils/map";
import { Style } from "ol/style";
import {
  createHistoryEntryForFeatures,
  getInfoFromFeature,
} from "./historyUtil";

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

  const modify = useMemo(() => {
    const getFeaturesAtPixel = (
      event: MapBrowserEvent<MouseEvent>,
    ): FeatureLike[] =>
      map.getFeaturesAtPixel(event.pixel, {
        layerFilter: (layer) => layer === editLayer,
        hitTolerance: pixelTolerance,
      });

    const getActiveFeaturesAtPixel = (
      event: MapBrowserEvent<MouseEvent>,
    ): FeatureLike[] => {
      return getFeaturesAtPixel(event)
        .filter((feature) => feature.getGeometry() instanceof LineString)
        .filter((feature) => !featureIsArchived(feature));
    };

    // TODO: Vi burde finne et felles sett med sjekker som alle modifications går gjennom.
    // Det er per nå flere sjekker som blir gjort flere steder, hvorav vi bare på noen av dem ønsker å sende inn en toast til brukeren.
    return new Modify({
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
            // Representasjonspunkter skal ikke kunne modifiseres
            return (
              !featureIsArchived(feature) &&
              !(feature.getId() as string).includes("representasjonspunkt")
            );
          },
        ),
      ),
      pixelTolerance: pixelTolerance,
      condition: (event: MapBrowserEvent<MouseEvent>) => {
        if (activeModeTools.includes("move")) return false;
        if (disallowedPointModes.includes(activeTool)) return false;
        if (activeTool === "detach" && selectedFeatures.length === 0)
          return false;

        const activeFeatures = getActiveFeaturesAtPixel(event);

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
      style: activeModeTools.includes("move")
        ? new Style()
        : selectedPointStyle,
      insertVertexCondition: () => {
        if (activeTool === "add") {
          toast({ description: "Punktet ble lagt til", status: "success" });
          return true;
        }
        return false;
      },
      deleteCondition: (event: MapBrowserEvent<MouseEvent>) => {
        if (activeModeTools.includes("move")) return false;

        if (activeTool === "remove" && click(event)) {
          const activeFeatures = getActiveFeaturesAtPixel(event);

          if (!activeFeatures.every(featureIsEditable)) {
            return false;
          }

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
          toast({ description: "Punktet ble fjernet", status: "success" });
          return true;
        }
        return false;
      },
    });
  }, [
    activeModeTools,
    activeTool,
    disallowedPointModes,
    editLayer,
    featureIsArchived,
    featureIsEditable,
    selectedFeatures,
    toast,
  ]);

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
      const features = e.features.getArray();
      if (features.length > 0) {
        addHistoryEntry({
          type: "grense",
          changes: createHistoryEntryForFeatures(features),
        });
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

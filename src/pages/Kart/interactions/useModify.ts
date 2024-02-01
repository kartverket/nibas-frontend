import { useEffect, useMemo } from "react";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import { useHistory } from "contexts/HistoryContext";
import { click, primaryAction } from "ol/events/condition";
import { Collection, MapBrowserEvent } from "ol";
import { editSource } from "hooks/layers/constants";
import { pixelTolerance, previousCoordinateKey } from "./constants";
import { Tool, useToolbar } from "contexts/ToolbarContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { selectedPointStyle } from "utils/map/layerStyles";
import { useToast } from "@kvib/react";
import { Style } from "ol/style";
import { createHistoryChangesFromFeatures, getInfoFromFeature } from "./historyUtil";
import { useGetFeatures } from "./utils";

const useModify = () => {
  const { addHistoryEntry } = useHistory();
  const { activeTool, activeModeTools } = useToolbar();
  const { selectedFeatures, featureIsEditable, featureIsArchived } = useFeatureStyle();
  const toast = useToast();
  const { getActiveFeaturesAtPixel, getFeaturesAtPixel } = useGetFeatures();

  // Ønsker helst at redigering ikke skal være aktiv under enkelte verktøy
  const disallowedPointModes: Tool[] = useMemo(() => ["draw", "split", "metadata", "archive", "koordinater"], []);

  const modify = useMemo(() => {
    // TODO: Vi burde finne et felles sett med sjekker som alle modifications går gjennom.
    // Det er per nå flere sjekker som blir gjort flere steder, hvorav vi bare på noen av dem ønsker å sende inn en toast til brukeren.
    return new Modify({
      features: new Collection(
        (editSource.getFeaturesCollection()!.getArray() ?? []).filter((feature) => {
          // Ved løsriving ønsker vi kun å kunne påvirke valgte features
          if (activeTool === "detach") {
            return selectedFeatures.some((sf) => sf.getId() === feature.getId());
          }

          // Arkiverte features skal ikke kunne modifiseres
          // Representasjonspunkter skal ikke kunne modifiseres
          return !featureIsArchived(feature) && !(feature.getId() as string).includes("representasjonspunkt");
        }),
      ),
      pixelTolerance: pixelTolerance,
      condition: (event: MapBrowserEvent<MouseEvent>) => {
        if (activeModeTools.includes("move")) return false;
        if (disallowedPointModes.includes(activeTool)) return false;
        if (activeTool === "detach" && selectedFeatures.length === 0) return false;

        const activeFeatures = getActiveFeaturesAtPixel(event, "edit");

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
      style: activeModeTools.includes("move") ? new Style() : selectedPointStyle,
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
          const activeFeatures = getActiveFeaturesAtPixel(event, "edit");

          if (!activeFeatures.every(featureIsEditable)) {
            return false;
          }

          const featuresAtPixel = getFeaturesAtPixel(event, "edit");

          // Dersom noen av featurene vi trykker på har for få punkter skal vi ikke fjerne punktet
          for (const feature of featuresAtPixel) {
            const geometry = feature.getGeometry();
            if (geometry instanceof LineString) {
              const coordinates = geometry.getCoordinates();
              if (coordinates.length <= 2) {
                return false;
              }
            }
          }

          // I tilfellet vi har én LineString og ett punkt er det sikkert lurt å filtrere kun etter linestrings
          const lineStringsAtPixel = featuresAtPixel.filter((featureLike) => {
            return featureLike.getGeometry() instanceof LineString;
          });

          // Vi ønsker ikke å slette punkter i knutepunkter
          if (lineStringsAtPixel.length > 1) {
            toast({
              description: "Kan ikke slette punkter i knutepunkter, løsriv grensen først",
              status: "error",
            });
            return false;
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
    featureIsArchived,
    featureIsEditable,
    getActiveFeaturesAtPixel,
    getFeaturesAtPixel,
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
          changes: createHistoryChangesFromFeatures(features),
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

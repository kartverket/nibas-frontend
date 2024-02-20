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
import { useToast } from "@kvib/react";
import { Style } from "ol/style";
import { createGrenseHistoryChange, getInfoFromFeature } from "./historyUtil";
import { useGetFeatures } from "./utils";
import { isAdministrativGrense } from "utils/grenser";
import { isFeatureEditable } from "utils/features";
import { findNearbyVertexOnFeature } from "utils/map";
import useToastCounter from "hooks/useToastCounter";
import { Geometry } from "ol/geom";

const useModify = () => {
  const { addHistoryEntry } = useHistory();
  const { activeTool, activeModeTools } = useToolbar();
  const { selectedFeatures, featureIsArchived } = useFeatureStyle();
  const toast = useToast();
  const { toastCounter: removeToast } = useToastCounter("success", "Punktet ble fjernet", "punkter ble fjernet");
  const { toastCounter: addToast } = useToastCounter("success", "Punktet ble lagt til", "punkter ble lagt til");
  const { getActiveFeaturesAtPixel, getFeaturesAtPixel } = useGetFeatures();

  // Ønsker helst at redigering ikke skal være aktiv under enkelte verktøy
  const disallowedPointModes: Tool[] = useMemo(() => ["draw", "split", "grenseinfo", "archive", "koordinater"], []);

  const modify = useMemo(() => {
    // TODO: Vi burde finne et felles sett med sjekker som alle modifications går gjennom.
    // Det er per nå flere sjekker som blir gjort flere steder, hvorav vi bare på noen av dem ønsker å sende inn en toast til brukeren.

    const detachMode = activeTool === "detach" && selectedFeatures.length > 0;

    return new Modify({
      features: detachMode ? new Collection(selectedFeatures) : undefined,
      source: detachMode ? undefined : editSource,
      pixelTolerance: pixelTolerance,
      condition: (event: MapBrowserEvent<MouseEvent>) => {
        if (activeModeTools.includes("move")) return false;
        if (disallowedPointModes.includes(activeTool)) return false;
        if (activeTool === "detach" && selectedFeatures.length === 0) return false;

        // TODO: håndteringen her er halvveis etter omskriving tilbake til feature/source-split
        // man kan endre arkiverte features via endepunkter
        // løsningen er å ha arkiverte features i eget lag, som steffen jobber med iirc
        const activeFeatures = getActiveFeaturesAtPixel(event, "edit");

        // Unngå interaksjon med inaktive features (representasjonspunkter f.eks.)
        if (activeFeatures.length === 0) {
          return false;
        }

        // Sjekk alle featurene i punktet, hvis en av dem ikke skal kunne endres ønsker vi ikke å endre noe
        if (activeFeatures.some((feature) => !isFeatureEditable(feature, featureIsArchived(feature)))) {
          toast({
            status: "error",
            title: "Denne grensen er ikke redigerbar",
            description: activeFeatures.some((feature) => isAdministrativGrense(feature.get("type")))
              ? "Ved endring av administrative grenser må du skru på visning for alle kretser som er knyttet til grensen"
              : undefined,
          });
          return false;
        }

        // Hvis vi ikke har en spesiell regel bruker vi default condition, som er primaryAction her
        return primaryAction(event);
      },
      style: new Style(),
      insertVertexCondition: () => {
        if (activeTool === "add") {
          addToast();
          return true;
        }
        return false;
      },
      deleteCondition: (event: MapBrowserEvent<MouseEvent>) => {
        if (activeModeTools.includes("move")) return false;

        if (activeTool === "remove" && click(event)) {
          const activeFeatures = getActiveFeaturesAtPixel(event, "edit");

          if (!activeFeatures.every((feature) => isFeatureEditable(feature, featureIsArchived(feature)))) {
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

          const nearbyVertexCoordinate = findNearbyVertexOnFeature(
            lineStringsAtPixel[0].getGeometry() as LineString,
            event.coordinate,
          );

          // Vi trykket bare på en linje, ikke et punkt
          if (!nearbyVertexCoordinate) {
            return false;
          }

          removeToast();

          // Hvis alt ellers ser greit ut så fjernes punktet på klikk
          return true;
        }
        return false;
      },
    });
  }, [
    activeModeTools,
    activeTool,
    selectedFeatures,
    disallowedPointModes,
    getActiveFeaturesAtPixel,
    featureIsArchived,
    toast,
    addToast,
    getFeaturesAtPixel,
    removeToast,
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
    const addModificationToHistory = (features: Feature<Geometry>[]) => {
      if (features.length > 0) {
        addHistoryEntry({
          type: "grense",
          changes: createGrenseHistoryChange(features),
        });
      }
      // TODO: hvis man har kjørt en detach vil vi kanskje sjekke om featuren nå er en løs tråd
    };
    const updateFeatureOnModification = (event: ModifyEvent) => {
      // console.log(event.features);
      if (activeTool === "detach") {
        if (selectedFeatures.length === 0) return;

        const activeFeatures = getActiveFeaturesAtPixel(event.mapBrowserEvent, "edit");

        const selectedFeatureIds = selectedFeatures.map((feature) => feature.getId());
        if (selectedFeatureIds.length !== 1) return; // Dette burde ikke skje
        const selectedFeature = selectedFeatures[0];

        const nonSelectedActiveFeatures = activeFeatures.filter(
          (feature) => selectedFeature.getId() !== feature.getId(),
        );

        // Hvis vi ender opp på én grense, må vi sjekke om det er et endepunkt vi har landet på, for ikke-endepunkter oppfører seg annerledes
        if (nonSelectedActiveFeatures.length === 1) {
          const nearbyVertex = findNearbyVertexOnFeature(
            nonSelectedActiveFeatures[0].getGeometry() as LineString,
            event.mapBrowserEvent.coordinate,
          );

          if (nearbyVertex) {
            // TODO Dele grense her
          } else {
            const previousFeatureCoordinates = selectedFeature.get(previousCoordinateKey);

            if (previousFeatureCoordinates) {
              const geometry = selectedFeature.getGeometry();
              geometry?.setCoordinates(previousFeatureCoordinates);

              toast({ title: "Løsrevede punkter kan kun plasseres på andre punkter", status: "warning" });
              return;
            }
          }
        }
      }
      addModificationToHistory(event.features.getArray());
    };

    modify.on("modifyend", updateFeatureOnModification);

    return () => {
      modify.un("modifyend", updateFeatureOnModification);
    };
  }, [activeTool, addHistoryEntry, getActiveFeaturesAtPixel, modify, selectedFeatures, toast]);

  return { modify };
};

export default useModify;

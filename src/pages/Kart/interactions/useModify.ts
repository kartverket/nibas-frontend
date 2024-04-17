import { useEffect, useMemo } from "react";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { click, primaryAction } from "ol/events/condition";
import { Collection, MapBrowserEvent } from "ol";
import { pixelTolerance, previousCoordinateKey } from "./constants";
import { Tool, useToolbar } from "contexts/ToolbarContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { useToast } from "@kvib/react";
import { Style } from "ol/style";
import { createGrenseHistoryChange } from "./grense-history-utils";
import { useGetFeatures } from "./interaction-utils";
import { isAdministrativGrense } from "utils/grenser";
import { isFeatureEditable, isPreviousAndCurrentCoordinatesEqual } from "utils/features";
import { findNearbyVertexOnFeature } from "utils/map/map-utils";
import useToastCounter from "hooks/toast/useToastCounter";
import { Geometry } from "ol/geom";
import { useConfirmationModal } from "contexts/ConfirmationModalContext";
import useSplit from "./useSplit";
import { Coordinate, equals } from "ol/coordinate";

const useModify = () => {
  const { addHistoryEntry } = useHistory();
  const { activeTool, activeModeTools } = useToolbar();
  const { selectedFeatures, featureIsArchived } = useFeatureStyle();
  const toast = useToast();
  const { toastCounter: removeToast } = useToastCounter(
    { status: "success" },
    "Punktet ble fjernet",
    "punkter ble fjernet",
  );
  const { toastCounter: addToast } = useToastCounter(
    { status: "success" },
    "Punktet ble lagt til",
    "punkter ble lagt til",
  );
  const { getLineStringFeaturesAtPixel } = useGetFeatures();
  const { performFeatureSplit } = useSplit();
  const confirmationModal = useConfirmationModal();

  // Ønsker helst at redigering ikke skal være aktiv under enkelte verktøy
  const disallowedPointModes: Tool[] = useMemo(() => ["draw", "split", "grenseinfo", "archive", "koordinater"], []);

  const modify = useMemo(() => {
    return new Modify({
      features: new Collection(selectedFeatures),
      pixelTolerance: pixelTolerance,
      condition: (event: MapBrowserEvent<MouseEvent>) => {
        if (activeModeTools.includes("move")) return false;
        if (disallowedPointModes.includes(activeTool)) return false;

        const activeFeatures = getLineStringFeaturesAtPixel(event, "edit");

        // Unngå interaksjon med inaktive features (representasjonspunkter f.eks.)
        if (activeFeatures.length === 0) {
          return false;
        }

        // Sjekk alle featurene i punktet, hvis en av dem ikke skal kunne endres ønsker vi ikke å endre noe
        if (selectedFeatures.some((feature) => !isFeatureEditable(feature, featureIsArchived(feature)))) {
          toast({
            status: "error",
            title: "Denne grensen er ikke redigerbar",
            description: selectedFeatures.some((feature) => isAdministrativGrense(feature.get("type")))
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
          const activeFeatures = getLineStringFeaturesAtPixel(event, "edit");

          if (!activeFeatures.every((feature) => isFeatureEditable(feature, featureIsArchived(feature)))) {
            return false;
          }

          // Dersom noen av featurene vi trykker på har for få punkter skal vi ikke fjerne punktet
          for (const feature of activeFeatures) {
            const coordinates = feature.getGeometry()?.getCoordinates() ?? [];
            if (coordinates.length <= 2) {
              return false;
            }
          }

          // Vi ønsker ikke å slette punkter i knutepunkter
          if (activeFeatures.length > 1) {
            toast({
              description: "Kan ikke slette punkter i knutepunkter, løsriv grensen først",
              status: "error",
            });
            return false;
          }

          const nearbyVertexCoordinate = findNearbyVertexOnFeature(
            activeFeatures[0].getGeometry() as LineString,
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
    getLineStringFeaturesAtPixel,
    featureIsArchived,
    toast,
    addToast,
    removeToast,
  ]);

  useEffect(() => {
    const saveCoordinatesBeforeModification = (e: ModifyEvent) => {
      e.features.forEach((feature) => {
        const featureId = feature.getId()?.toString();
        if (featureId === undefined) return;

        const geometry = feature.getGeometry();
        if (geometry instanceof LineString) {
          feature.set(previousCoordinateKey, geometry.getCoordinates());
        }
      });

      // insertVertex utløser ikke pointerup-events, som gjør at vi må gjøre history-endringen for å legge til punkt her
      if (activeTool === "add" && !e.mapBrowserEvent.dragging) {
        addHistoryEntry([
          {
            type: "grense",
            changes: createGrenseHistoryChange(e.features.getArray()),
          },
        ]);
      }
    };
    modify.on("modifystart", saveCoordinatesBeforeModification);

    return () => {
      modify.un("modifystart", saveCoordinatesBeforeModification);
    };
  }, [activeTool, addHistoryEntry, modify]);

  useEffect(() => {
    const addModificationToHistory = (features: Feature<Geometry>[]) => {
      if (features.length > 0) {
        addHistoryEntry([
          {
            type: "grense",
            changes: createGrenseHistoryChange(features),
          },
        ]);
      }
    };

    const setPreviousCoordinatesForFeature = (feature: Feature<LineString>) => {
      const previousFeatureCoordinates = feature.get(previousCoordinateKey) as Coordinate[] | undefined;

      if (previousFeatureCoordinates !== undefined) {
        const geometry = feature.getGeometry();
        geometry?.setCoordinates(previousFeatureCoordinates);
      }
    };

    const updateFeatureOnModification = async (event: ModifyEvent) => {
      // Hvis man har valgt én feature kan det føre til løsriving
      if (selectedFeatures.length === 1) {
        const selectedFeature = selectedFeatures[0];
        if (isPreviousAndCurrentCoordinatesEqual(selectedFeature)) return;

        const activeFeatures = getLineStringFeaturesAtPixel(event.mapBrowserEvent, "edit");

        const nonSelectedActiveFeatures = activeFeatures.filter(
          (feature) => selectedFeature.getId() !== feature.getId(),
        );

        if (nonSelectedActiveFeatures.some((feature) => !isFeatureEditable(feature))) {
          toast({
            status: "error",
            title: "Grensen er ikke redigerbar",
            description: "Du kan ikke sette en løsrevet grense på en ikke-redigerbar grense",
          });
          setPreviousCoordinatesForFeature(selectedFeature);
          return;
        }

        // Hvis vi ender opp på én grense, må vi sjekke om det er et endepunkt vi har landet på, for ikke-endepunkter oppfører seg annerledes
        if (nonSelectedActiveFeatures.length === 1) {
          const nonSelectedActiveFeature = nonSelectedActiveFeatures[0] as Feature<LineString>;
          const nonSelectedActiveFeatureGeometry = nonSelectedActiveFeature.getGeometry();

          if (!nonSelectedActiveFeatureGeometry) return;

          const nearbyVertex = findNearbyVertexOnFeature(
            nonSelectedActiveFeatureGeometry,
            event.mapBrowserEvent.coordinate,
          );

          if (nearbyVertex) {
            const nonSelectedActiveFeatureCoordinates = nonSelectedActiveFeatureGeometry.getCoordinates();

            // Vi trenger ikke gjøre noe hvis man ender opp på samme punkt som man løsrev fra
            if (
              equals(nearbyVertex, nonSelectedActiveFeatureCoordinates[0]) ||
              equals(nearbyVertex, nonSelectedActiveFeatureCoordinates[nonSelectedActiveFeatureCoordinates.length - 1])
            ) {
              return;
            }

            const isAccepted = await confirmationModal.openAsync({
              title: "Deling av grense",
              description:
                "Plasserer man et punkt på noe annet enn et endepunkt vil grensen deles i to deler. Er du sikker på at du vil dele grensen?",
              acceptText: "Del grense",
              declineText: "Avbryt",
            });

            if (isAccepted) {
              performFeatureSplit(nonSelectedActiveFeature, [nearbyVertex]);
            } else {
              setPreviousCoordinatesForFeature(selectedFeature);
              return;
            }
          } else {
            setPreviousCoordinatesForFeature(selectedFeature);
            toast({ title: "Løsrevede punkter kan kun plasseres på andre punkter", status: "warning" });
            return;
          }
        }
      }

      addModificationToHistory(event.features.getArray());
    };

    modify.on("modifyend", updateFeatureOnModification);

    return () => {
      modify.un("modifyend", updateFeatureOnModification);
    };
  }, [
    activeTool,
    addHistoryEntry,
    confirmationModal,
    getLineStringFeaturesAtPixel,
    modify,
    performFeatureSplit,
    selectedFeatures,
    toast,
  ]);

  return { modify };
};

export default useModify;

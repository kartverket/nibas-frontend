import { useToast } from "@kvib/react";
import { useConfirmationModal } from "contexts/ConfirmationModalContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { Tool, useToolbar } from "contexts/ToolbarContext";
import useToastCounter from "hooks/toast/useToastCounter";
import { Collection, MapBrowserEvent } from "ol";
import { Coordinate, equals } from "ol/coordinate";
import { click, primaryAction } from "ol/events/condition";
import BaseEvent from "ol/events/Event";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import LineString from "ol/geom/LineString";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import { Style } from "ol/style";
import { useEffect, useMemo } from "react";
import { FeatureProperties, Metadata } from "types/api";
import { isFeatureEditable, isFeatureToBeArchived, isPreviousAndCurrentCoordinatesEqual } from "utils/features";
import { isAdministrativGrense } from "utils/grenser";
import { findNearbyVertexOnFeature } from "utils/map/map-utils";
import {
  isTeiggrenseMetadataWFS,
  isTeiggrenseMetadata,
} from "../OverlayPanels/GrenseinformasjonPanel/Matrikkelgrenseinformasjon";
import { pixelTolerance, previousCoordinateKey } from "./constants";
import { createGrenseHistoryChange } from "./grense-history-utils";
import { useGetFeatures } from "./interaction-utils";
import useSplit from "./useSplit";

export type ContextualPosisjonskvalitet = {
  grensetype: "teig" | "nibas";
  maalemetode: string | undefined;
  noeyaktighet: number | undefined;
};

const useModify = () => {
  const { addHistoryEntry } = useHistory();
  const { activeTool, activeModeTools } = useToolbar();
  const { selectedFeatures } = useFeatureStyle();
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
  const disallowedPointModes: Tool[] = useMemo(
    () => ["draw", "split", "grenseinfo", "archive", "koordinater", "duplicate"],
    [],
  );

  const modify = useMemo(() => {
    return new Modify({
      features: new Collection(selectedFeatures),
      pixelTolerance: pixelTolerance,
      condition: (event) => {
        if (activeModeTools.includes("move")) {
          return false;
        }
        if (disallowedPointModes.includes(activeTool)) {
          return false;
        }

        const activeFeatures = getLineStringFeaturesAtPixel(event as MapBrowserEvent<PointerEvent>, ["edit"]);

        // Unngå interaksjon med inaktive features (representasjonspunkter f.eks.)
        if (activeFeatures.length === 0) {
          return false;
        }

        // Sjekk alle featurene i punktet, hvis en av dem ikke skal kunne endres ønsker vi ikke å endre noe
        if (selectedFeatures.some((feature) => !isFeatureEditable(feature, isFeatureToBeArchived(feature)))) {
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
      insertVertexCondition: (event) => {
        if (activeTool === "add" && primaryAction(event)) {
          return true;
        }
        return false;
      },
      deleteCondition: (event) => {
        if (activeModeTools.includes("move")) {
          return false;
        }

        if (activeTool === "remove" && click(event)) {
          const activeFeatures = getLineStringFeaturesAtPixel(event as MapBrowserEvent<PointerEvent>, ["edit"]);

          if (!activeFeatures.every((feature) => isFeatureEditable(feature, isFeatureToBeArchived(feature)))) {
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
    toast,
    removeToast,
  ]);

  useEffect(() => {
    const createAddPointGrenseEntry = (ev: BaseEvent) => {
      const changedFeature = ev.target as Feature<Geometry>;
      if (changedFeature.getGeometry() instanceof LineString) {
        addToast();
        addHistoryEntry({
          type: "grense",
          changes: createGrenseHistoryChange([changedFeature]),
        });
      }
    };

    const saveCoordinatesBeforeModification = (e: ModifyEvent) => {
      e.features.forEach((feature) => {
        const featureId = feature.getId()?.toString();
        if (featureId === undefined) {
          return;
        }

        const geometry = feature.getGeometry();
        if (geometry instanceof LineString) {
          feature.set(previousCoordinateKey, geometry.getCoordinates());
          // Når vi legger til en vertex på en feature avfyres det ikke et modifyend-event (pointerup) når vertexen har blitt lagt på, så vi må derfor lytte på featuren i stedet for.
          if (activeTool === "add" && !e.mapBrowserEvent.dragging) {
            feature.once("change", createAddPointGrenseEntry);
            return () => {
              feature.un("change", createAddPointGrenseEntry);
            };
          }
        }
      });
    };

    modify.on("modifystart", saveCoordinatesBeforeModification);

    return () => {
      modify.un("modifystart", saveCoordinatesBeforeModification);
    };
  }, [activeTool, addHistoryEntry, addToast, modify]);

  useEffect(() => {
    const addModificationToHistory = (features: Feature<Geometry>[]) => {
      if (features.length > 0) {
        addHistoryEntry({
          type: "grense",
          changes: createGrenseHistoryChange(features),
        });
      }
    };

    const setPreviousCoordinatesForFeature = (feature: Feature<LineString>) => {
      const previousFeatureCoordinates = feature.get(previousCoordinateKey) as Coordinate[] | undefined;

      if (previousFeatureCoordinates !== undefined) {
        const geometry = feature.getGeometry();
        geometry?.setCoordinates(previousFeatureCoordinates);
      }
    };

    const onSnap = (event: ModifyEvent, actingLineString: Feature<Geometry>, pointCoords: Coordinate) => {
      // Vi ønsker ikke å arve posisjonskvalitet fra grenser i redigeringsmodus
      const targetFeatures = getLineStringFeaturesAtPixel(event.mapBrowserEvent as MapBrowserEvent<PointerEvent>, [
        "matrikkel",
        "fylke",
        "kommune",
        "nasjon",
        "grunnkrets",
        "stemmekrets",
        "archived",
        "measure",
      ]).filter((f) => f.getId() !== actingLineString.getId());
      // hvis det er et knutepunkt ønsker ikke å sette egenskaper man kan arve da vi ikke vet hvilken grense man prøver å kopiere fra.
      if (targetFeatures.length === 1) {
        const featureProperties = targetFeatures[0].getProperties();
        let targetLineStringPosisjonskvalitet: ContextualPosisjonskvalitet | undefined;
        if (isTeiggrenseMetadata(featureProperties)) {
          targetLineStringPosisjonskvalitet = {
            grensetype: "teig",
            maalemetode: featureProperties.malemetodeId?.toString(),
            noeyaktighet: featureProperties.noyaktighet ?? undefined,
          };
        } else if (isTeiggrenseMetadataWFS(featureProperties)) {
          targetLineStringPosisjonskvalitet = {
            grensetype: "teig",
            maalemetode: featureProperties.MALEMETODE?.toString(),
            noeyaktighet: featureProperties.NOYAKTIGHET ?? undefined,
          };
        } else {
          const posisjonskvalitet = ((featureProperties as FeatureProperties).metadata as Metadata).commonGrense
            ?.posisjonskvalitet;
          targetLineStringPosisjonskvalitet = {
            grensetype: "nibas",
            maalemetode: posisjonskvalitet?.maalemetode.id,
            noeyaktighet: posisjonskvalitet?.noeyaktighet,
          };
        }
        const snappedPosisjonskvaliteter: Map<string, ContextualPosisjonskvalitet> =
          actingLineString.get("snapData") ?? new Map();
        actingLineString.set(
          "snapData",
          snappedPosisjonskvaliteter.set(pointCoords.toString(), targetLineStringPosisjonskvalitet),
        );
      }
    };

    const updateFeatureOnModification = async (event: ModifyEvent) => {
      // Hvis man har valgt én feature kan det føre til løsriving
      if (selectedFeatures.length === 1) {
        const selectedFeature = selectedFeatures[0];
        if (isPreviousAndCurrentCoordinatesEqual(selectedFeature)) {
          return;
        }

        const activeFeatures = getLineStringFeaturesAtPixel(event.mapBrowserEvent as MapBrowserEvent<PointerEvent>, [
          "edit",
        ]);

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

          if (!nonSelectedActiveFeatureGeometry) {
            return;
          }

          const nearbyVertex = findNearbyVertexOnFeature(
            nonSelectedActiveFeatureGeometry,
            event.mapBrowserEvent.coordinate,
          );

          if (nearbyVertex) {
            const nonSelectedActiveFeatureCoordinates = nonSelectedActiveFeatureGeometry.getCoordinates();

            //hvis vi er på et endepunkt trenger vi ikke å dele
            const nearbyVertexIsEndpoint = nonSelectedActiveFeatureCoordinates.some(
              (coordinates, index) =>
                equals(coordinates, nearbyVertex) &&
                (index === 0 || index === nonSelectedActiveFeatureCoordinates.length - 1),
            );
            if (!nearbyVertexIsEndpoint) {
              if (
                (!nearbyVertexIsEndpoint && equals(nearbyVertex, nonSelectedActiveFeatureCoordinates[0])) ||
                equals(
                  nearbyVertex,
                  nonSelectedActiveFeatureCoordinates[nonSelectedActiveFeatureCoordinates.length - 1],
                )
              ) {
                return;
              }

              // spør om bruker ønsker å dele hvis nearbyVertex ikke er endepunkt
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
            }
            // Vi trenger ikke gjøre noe hvis man ender opp på samme punkt som man løsrev fra
          } else {
            setPreviousCoordinatesForFeature(selectedFeature);
            toast({ title: "Løsrevede punkter kan kun plasseres på andre punkter", status: "warning" });
            return;
          }
        }
        onSnap(event, selectedFeature, event.mapBrowserEvent.coordinate);
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

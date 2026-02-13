import { useToast } from "@kvib/react";
import { useConfirmationModal } from "contexts/ConfirmationModalContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { Tool, useToolbar } from "contexts/ToolbarContext";
import { VectorLayerId } from "hooks/layers/types";
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
import { useEffect, useMemo, useRef } from "react";
import { FeatureProperties, Metadata } from "types/api";
import { isFeatureEditable, isFeatureToBeArchived, isPreviousAndCurrentCoordinatesEqual } from "utils/features";
import { isAdministrativGrense } from "utils/grenser";
import { findNearbyVertexOnFeature } from "utils/map/map-utils";
import {
  isTeiggrenseMetadata,
  isTeiggrenseMetadataWFS,
} from "../OverlayPanels/GrenseinformasjonPanel/Matrikkelgrenseinformasjon";
import { roundToNearestHalf } from "../OverlayPanels/NavigasjonPanel/koordinater-utils";
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

  // Setter opp refs for å unngår unødvendige re-renders av Modify interaksjonen i useInteractions.
  // Vi oppdaterer disse uavhengig av modify, og modify leser nyeste verdier slik det ville gjort om vi hadde de i memo.
  // TODO: Bruk useEffectEvent når vi har React 19.
  const activeToolRef = useRef(activeTool);
  const activeModeToolsRef = useRef(activeModeTools);
  const selectedFeaturesRef = useRef(selectedFeatures);
  const getLineStringFeaturesAtPixelRef = useRef(getLineStringFeaturesAtPixel);
  const toastRef = useRef(toast);
  const removeToastRef = useRef(removeToast);

  useEffect(() => {
    activeToolRef.current = activeTool;
    activeModeToolsRef.current = activeModeTools;
    selectedFeaturesRef.current = selectedFeatures;
    getLineStringFeaturesAtPixelRef.current = getLineStringFeaturesAtPixel;
    toastRef.current = toast;
    removeToastRef.current = removeToast;
  }, [activeTool, activeModeTools, selectedFeatures, getLineStringFeaturesAtPixel, toast, removeToast]);

  // Vi trenger en stabil collection av selectedFeatures siden Modify interactionen ikke kan bruke refs til selectedFeatures direkte.
  // Så vi gir listen én gang til modify via ref, og oppdaterer den manuelt. Modify lytter under the hood på changes i collectionen.
  const featuresCollectionRef = useRef(new Collection(selectedFeatures));
  useEffect(() => {
    const collection = featuresCollectionRef.current;
    collection.clear();
    selectedFeatures.forEach((f) => collection.push(f));
  }, [selectedFeatures]);

  // Ønsker helst at redigering ikke skal være aktiv under enkelte verktøy
  // Lager Modify interactionen kun én gang, callbacks leser fra refs.
  const modify = useMemo(
    () =>
      new Modify({
        features: featuresCollectionRef.current,
        pixelTolerance: pixelTolerance,
        condition: (event) => {
          const disallowedPointModes: Tool[] = ["draw", "split", "grenseinfo", "archive", "koordinater", "duplicate"];
          if (activeModeToolsRef.current.includes("move")) {
            return false;
          }
          if (disallowedPointModes.includes(activeToolRef.current)) {
            return false;
          }

          const activeFeatures = getLineStringFeaturesAtPixelRef.current(event as MapBrowserEvent<PointerEvent>, [
            "edit",
          ]);

          // Unngå interaksjon med inaktive features (representasjonspunkter f.eks.)
          if (activeFeatures.length === 0) {
            return false;
          }

          // Sjekk alle featurene i punktet, hvis en av dem ikke skal kunne endres ønsker vi ikke å endre noe
          if (
            selectedFeaturesRef.current.some((feature) => !isFeatureEditable(feature, isFeatureToBeArchived(feature)))
          ) {
            toastRef.current({
              status: "error",
              title: "Denne grensen er ikke redigerbar",
              description: selectedFeaturesRef.current.some((feature) => isAdministrativGrense(feature.get("type")))
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
          if (activeToolRef.current === "add" && primaryAction(event)) {
            return true;
          }
          return false;
        },
        deleteCondition: (event) => {
          if (activeModeToolsRef.current.includes("move")) {
            return false;
          }

          if (activeToolRef.current === "remove" && click(event)) {
            const activeFeatures = getLineStringFeaturesAtPixelRef.current(event as MapBrowserEvent<PointerEvent>, [
              "edit",
            ]);

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
              toastRef.current({
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

            removeToastRef.current();

            // Hvis alt ellers ser greit ut så fjernes punktet på klikk
            return true;
          }
          return false;
        },
      }),
    [],
  );

  useEffect(() => {
    const createAddPointGrenseEntry = (ev: BaseEvent) => {
      const changedFeature = ev.target as Feature<Geometry>;
      if (changedFeature.getGeometry() instanceof LineString) {
        const geometry = changedFeature.getGeometry();
        // Avrunder bare det nye punktet som er lagt til
        if (geometry != null && geometry instanceof LineString) {
          const prevCoords = changedFeature.get(previousCoordinateKey) as [number, number][];
          const newCoords = geometry.getCoordinates();

          if (prevCoords != null && newCoords.length > prevCoords.length) {
            // Finn det nye punktet
            const updatedCoords = [...newCoords];
            const newPoint = updatedCoords.find(
              (coord) => !prevCoords.some((prev) => prev[0] === coord[0] && prev[1] === coord[1]),
            );
            if (newPoint) {
              const idx = updatedCoords.findIndex((coord) => coord[0] === newPoint[0] && coord[1] === newPoint[1]);
              updatedCoords[idx] = [roundToNearestHalf(newPoint[0]), roundToNearestHalf(newPoint[1])];
              geometry.setCoordinates(updatedCoords);
            }
          }
        }
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
      // Avrunder koordinatene til nærmeste halve cm, maks 3 desimaler før lagring i historikken
      if (features.length > 0) {
        features.forEach((feature) => {
          const geometry = feature.getGeometry();
          if (geometry != null && geometry instanceof LineString) {
            const coords = geometry.getCoordinates();
            const rounded = coords.map((coord) => [roundToNearestHalf(coord[0]), roundToNearestHalf(coord[1])]);
            geometry.setCoordinates(rounded);
          }
        });
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
        "FYLKE",
        "KOMMUNE",
        "GRUNNKRETS",
        "STEMMEKRETS",
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
        } else if (isTeiggrenseMetadataWFS(featureProperties) === true) {
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
        // Vi må runde av koordinatene til 3 desimaler (nærmeste halve cm)
        pointCoords = [roundToNearestHalf(pointCoords[0]), roundToNearestHalf(pointCoords[1])];
        const snappedPosisjonskvaliteter: Map<string, ContextualPosisjonskvalitet> =
          actingLineString.get("snapData") ?? new Map();
        actingLineString.set(
          "snapData",
          snappedPosisjonskvaliteter.set(pointCoords.toString(), targetLineStringPosisjonskvalitet),
        );
      }
    };

    const forcedSnapExit = () => {
      selectedFeatures.forEach((feature) => setPreviousCoordinatesForFeature(feature));
    };

    const updateFeatureOnModification = async (event: ModifyEvent) => {
      const nibasVectorLayers: VectorLayerId[] = [
        "FYLKE",
        "KOMMUNE",
        "GRUNNKRETS",
        "STEMMEKRETS",
        "archived",
        "sosiFiler",
      ];
      const matrikkelVectorLayers: VectorLayerId[] = ["matrikkel"];
      // Liste med lag som må snappes mot gitt tvungen snapping og snapmode (matrikkel og/eller nibas)
      const snappableLayers: VectorLayerId[] = [
        ...(activeModeTools.includes("snap_matrikkel") ? matrikkelVectorLayers : []),
        ...(activeModeTools.includes("snap_nibas") ? nibasVectorLayers : []),
      ];
      const activeFeatures = getLineStringFeaturesAtPixel(event.mapBrowserEvent as MapBrowserEvent<PointerEvent>, [
        "edit",
      ]);
      const nonSelectedActiveFeatures = activeFeatures.filter(
        (feature) => !selectedFeatures.map((f) => f.getId()).includes(feature.getId()),
      );
      const snappableFeatures = getLineStringFeaturesAtPixel(
        event.mapBrowserEvent as MapBrowserEvent<PointerEvent>,
        snappableLayers,
      );
      if (selectedFeatures.length > 1 && activeModeTools.includes("snap_forced")) {
        // Vi bryr oss kun om tilfeller der mer enn én feature blir modifisert hvis tvungen snapping er påskrudd.
        if (nonSelectedActiveFeatures.length === 0 && snappableFeatures.length === 0) {
          forcedSnapExit();
          return;
        }
        addModificationToHistory(event.features.getArray());
      } else if (selectedFeatures.length === 1) {
        // Hvis man har valgt én feature kan det føre til løsriving
        const selectedFeature = selectedFeatures[0];
        if (isPreviousAndCurrentCoordinatesEqual(selectedFeature)) {
          return;
        }

        if (
          activeModeTools.includes("snap_forced") &&
          nonSelectedActiveFeatures.length === 0 &&
          snappableFeatures.length === 0
        ) {
          forcedSnapExit();
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
              await confirmationModal.openAsync({
                title: "Deling av grense",
                description:
                  "Plasserer man et punkt på noe annet enn et endepunkt vil grensen deles i to deler. Er du sikker på at du vil dele grensen?",
                acceptText: "Del grense",
                declineText: undefined,
                neutralText: "Ikke del grense",
                onAccept: () => performFeatureSplit(nonSelectedActiveFeature, [nearbyVertex]),
                onDecline: () => setPreviousCoordinatesForFeature(selectedFeature),
                onNeutral: () => {},
              });
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
    activeModeTools,
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

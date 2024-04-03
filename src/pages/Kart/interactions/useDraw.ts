import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Draw, { DrawEvent } from "ol/interaction/Draw";
import { pixelTolerance } from "./constants";
import { useToolbar } from "contexts/ToolbarContext";
import { noModifierKeys } from "ol/events/condition";
import { grenseStyles } from "utils/map/layerStyles";
import { useEditAllGrenser } from "contexts/EditGrenserContext/EditGrenserContext";
import { getGrenseTypeFromEditingType } from "hooks/layers/types";
import { useToast } from "@kvib/react";
import { Feature, MapBrowserEvent } from "ol";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { getTempFeatureId } from "./temp-feature-id-utils";
import { createNyGrenseHistoryChanges } from "./grense-history-utils";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import LineString from "ol/geom/LineString";
import { useGetFeatures } from "./interaction-utils";
import { equals } from "ol/coordinate";
import { setDefaultFeatureProperties } from "utils/features";
import useSplit from "./useSplit";
import { useConfirmationModal } from "contexts/ConfirmationModalContext";
import { Geometry } from "ol/geom";
import { findNearbyVertexOnFeature } from "utils/map/map-utils";
import useToastUnique from "hooks/toast/useToastUnique";
import { addFeaturesToSource } from "utils/map/source";
import { editSource } from "hooks/layers/constants";

const useDraw = () => {
  const { activeTool, activeModeTools, toggleTool } = useToolbar();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const { addHistoryEntry } = useHistory();
  const { openOverlayPanel } = useOverlayPanel();
  const { selectFeatures, selectedFeatures } = useFeatureStyle();
  const { getActiveFeaturesAtPixel } = useGetFeatures();
  const toast = useToast();
  const { performFeatureSplit } = useSplit();
  const { openAsync } = useConfirmationModal();

  const { toastUnique: endpointToast } = useToastUnique({
    status: "warning",
    description: "Valgt punkt er ikke et endepunkt og vil resultere i en grensedeling ved avsluttet tegning",
  });

  const [draw, setDraw] = useState<Draw | null>(null);

  // TODO: fungerer ikke uten snap, vet ikke hvorfor
  const createDraw = useCallback(() => {
    const drawObj: Draw = new Draw({
      type: "LineString",
      snapTolerance: pixelTolerance,
      style: grenseStyles.select,
      freehandCondition: () => false,
      condition: (event: MapBrowserEvent<MouseEvent>) => {
        if (!noModifierKeys(event) || activeTool !== "draw" || activeModeTools.includes("move")) return false;
        if (drawObj == null) return false;
        const featuresAtPixel = getActiveFeaturesAtPixel(event, "edit");

        // Legg til feature hvis vi ikke treffer noen andre features
        if (featuresAtPixel.length === 0) {
          drawObj.changed();
          return true;
        }

        // Tror egentlig ikke det er nødvendig å sjekke alle features her, da vi vet at om man treffer et punkt på én så treffer man det samme punktet på andre
        // samtidig så er dette en særdeles lav performance kost (treffer sjelden mange features), og det er kanskje safere å helgardere oss
        for (const feature of featuresAtPixel) {
          const geometry = feature.getGeometry();

          if (geometry instanceof LineString) {
            const nearbyVertex = findNearbyVertexOnFeature(geometry, event.coordinate);

            if (nearbyVertex == null) {
              toast({
                status: "warning",
                title: "Punkter kan kun plasseres fritt eller på andre punkter",
              });
              return false;
            }

            const firstCoordinate = geometry.getFirstCoordinate();
            const lastCoordinate = geometry.getLastCoordinate();

            const isClickedPointEndPoint = [firstCoordinate, lastCoordinate].some((endpoint) =>
              equals(endpoint, event.coordinate),
            );

            if (!isClickedPointEndPoint) {
              endpointToast();
            }
          }
        }

        // Vi ønsker å avslutte tegningen hvis man har startet en tegning, og så treffer et punkt, så vi unngår rar geometri
        // Dette gjøres ved å bumpe et versjonstall med draw.changed() hvis denne conditionen returnerer true. Hvis versjonen da er høyere
        // enn null (som den blir av første endring), vil vi avslutte tegningen
        if (drawObj.getRevision() > 0) {
          drawObj.appendCoordinates([event.coordinate]);
          drawObj.finishDrawing();
          return false;
        }

        drawObj.changed();
        return true;
      },
    });
    return drawObj;
  }, [activeModeTools, activeTool, endpointToast, getActiveFeaturesAtPixel, toast]);

  useEffect(() => {
    if (draw == null) setDraw(createDraw());
    const addDrawToHistory = (drawnFeature: Feature<LineString>) => {
      const editingType = getCurrentlyEditingType();
      if (!editingType) return;

      const grenseType = getGrenseTypeFromEditingType(editingType);

      if (grenseType) {
        addHistoryEntry({
          type: "nygrense",
          changes: createNyGrenseHistoryChanges([drawnFeature], grenseType),
        });
      }
    };

    const onDrawAbort = () => {
      setDraw(createDraw());
    };

    const getUniqueFeaturesToSplitIfExists = (drawnFeatureGeometry: LineString) => {
      const drawnFeatureHead = drawnFeatureGeometry.getFirstCoordinate();
      const drawnFeatureTail = drawnFeatureGeometry.getLastCoordinate();

      const featuresAtHead = editSource.getFeaturesAtCoordinate(drawnFeatureHead);
      const featuresAtTail = editSource.getFeaturesAtCoordinate(drawnFeatureTail);

      // Hvis det er akkurat én feature på koordinatet til halen/hodet til den nye featuren, så betyr det at koordinatet treffer et punkt som ikke er endepunkt
      const featuresToBeSplit: Feature<Geometry>[] = [];
      if (featuresAtHead.length === 1) featuresToBeSplit.push(featuresAtHead[0]);
      if (featuresAtTail.length === 1) featuresToBeSplit.push(featuresAtTail[0]);

      return featuresToBeSplit.filter(
        (feature, index, allFeatures) => allFeatures.map((f) => f.getId()).indexOf(feature.getId()) === index,
      );
    };

    const splitFeatureAtDrawnFeatureEndpoints = (feature: Feature<Geometry>, drawnFeatureGeometry: LineString) => {
      const drawnFeatureHead = drawnFeatureGeometry.getFirstCoordinate();
      const drawnFeatureTail = drawnFeatureGeometry.getLastCoordinate();
      const geometry = feature.getGeometry();
      if (geometry && geometry instanceof LineString) {
        const coordinates = geometry.getCoordinates();
        const head = geometry.getFirstCoordinate();
        const tail = geometry.getLastCoordinate();

        const coordinatesToSplitAt = [drawnFeatureHead, drawnFeatureTail].filter((coordinate) => {
          if (!equals(coordinate, head) && !equals(coordinate, tail)) {
            return coordinates.some((toBeSplitCoordinate) => equals(toBeSplitCoordinate, coordinate));
          }
        });

        if (coordinatesToSplitAt.length > 0) {
          performFeatureSplit(feature, coordinatesToSplitAt);
        }
      }
    };

    const onDrawEnd = async (e: DrawEvent) => {
      const editingType = getCurrentlyEditingType();
      const drawnFeature = e.feature as Feature<LineString>;
      const drawnFeatureGeometry = drawnFeature.getGeometry();

      // Skal ikke være mulig da tegneverktøyet bare skal være tilgjengelig i redigering
      if (
        !editingType ||
        !drawnFeatureGeometry ||
        drawnFeatureGeometry.getLength() === 0 ||
        drawnFeatureGeometry.getCoordinates().length < 2
      ) {
        setDraw(createDraw());
        return;
      }

      const newId = getTempFeatureId();
      drawnFeature.setId(newId);

      const uniqueFeaturesToBeSplit = getUniqueFeaturesToSplitIfExists(drawnFeatureGeometry);

      for (const feature of uniqueFeaturesToBeSplit) {
        splitFeatureAtDrawnFeatureEndpoints(feature, drawnFeatureGeometry);
      }

      setDefaultFeatureProperties(drawnFeature, getGrenseTypeFromEditingType(editingType));

      addDrawToHistory(drawnFeature);
      addFeaturesToSource("edit", [drawnFeature]);

      toast({
        status: "success",
        title: "Grensen ble lagt til i kartet",
        description: "Grense lagt til med standardmetadata. Husk at du må sette tilhørighet på nye grenser.",
      });

      openOverlayPanel("grenseinfo");
      selectFeatures([drawnFeature]);

      // TODO: dersom man ønsker å utvide en grense ønsker vi nok å slå sammen den nye grensen med den gamle her
      // i så fall må vi holde styr på hvilken grense som skal utvides, og fra hvilket punkt. selectPoint kan være nyttig her
    };
    if (draw != null) {
      draw.on("drawend", onDrawEnd);
      draw.on("drawabort", onDrawAbort);
    }
    return () => {
      if (draw != null) {
        draw.un("drawend", onDrawEnd);
        draw.un("drawabort", onDrawAbort);
        setDraw(null);
      }
    };
  }, [
    addHistoryEntry,
    createDraw,
    draw,
    getCurrentlyEditingType,
    openAsync,
    openOverlayPanel,
    performFeatureSplit,
    selectFeatures,
    selectedFeatures,
    setDraw,
    toast,
    toggleTool,
  ]);

  return { draw };
};

export default useDraw;

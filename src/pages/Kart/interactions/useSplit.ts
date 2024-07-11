import LineString from "ol/geom/LineString";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { useToolbar } from "contexts/ToolbarContext";
import { Point } from "ol/geom";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Coordinate } from "ol/coordinate";
import { equals } from "ol/array";
import { getTempFeatureId, isTempFeatureId } from "./feature-id-utils";

export type SplittedFeature = {
  oldFeatureId: string;
  newFeatures: Feature<Geometry>[];
  oldFeature: Feature<Geometry>;
};

// OBS! Per nå skiller denne seg fra de andre interaksjonene ved at den ikke legges til som et event i kartet
// I stedet bruker man select og selectPoint etter hverandre, og utløser handlingen ved en knapp i React
const useSplit = () => {
  const { addHistoryEntry } = useHistory();
  const { activeTool } = useToolbar();
  const { selectedFeatures, selectedPoint } = useFeatureStyle();

  const createNewFeatures = (
    featureToSplit: Feature<Geometry>,
    coordinatesToSplit: Coordinate[],
  ): SplittedFeature | undefined => {
    const oldFeature = featureToSplit;
    const oldGeometry = oldFeature.getGeometry();
    if (oldGeometry instanceof LineString) {
      const allFeatureCoordinates = oldGeometry.getCoordinates();
      const oldFeatureId = oldFeature.getId()?.toString();

      if (oldFeatureId === undefined) {
        return;
      }

      // Ikke vits å gjøre splitting med mindre du har en linje med minst tre punkter
      if (allFeatureCoordinates.length > 2) {
        const splitIndices = coordinatesToSplit
          .map((coordinateToSplit) => {
            return allFeatureCoordinates.findIndex((coordinate) => equals(coordinate, coordinateToSplit));
          })
          .sort();

        // Dette verifiserer at de valgte punktene er gyldige punkter å splitte på grensen
        const allSplitIndicesAreValid = splitIndices.every(
          (index) => index > 0 && index < allFeatureCoordinates.length - 1,
        );

        if (allSplitIndicesAreValid) {
          const newIndices: number[][] = [];

          for (let i = 0; i < splitIndices.length + 1; i++) {
            if (i === 0) {
              newIndices.push([0, splitIndices[0]]);
            } else if (i === splitIndices.length) {
              newIndices.push([splitIndices[splitIndices.length - 1], allFeatureCoordinates.length]);
            } else {
              newIndices.push([splitIndices[i - 1], splitIndices[i]]);
            }
          }

          const newFeatures = newIndices.map((indices) =>
            createCloneOfFeatureWithPartsOfCoordinates(oldFeature, indices[0], indices[1]),
          );

          return {
            newFeatures,
            oldFeatureId,
            oldFeature,
          };
        }
      }
    }
  };

  const createCloneOfFeatureWithPartsOfCoordinates = (
    feature: Feature,
    startIndex: number,
    endIndex: number,
  ): Feature<Geometry> => {
    const newFeature = feature.clone();
    const newFeatureId = getTempFeatureId();
    const newGeometry = newFeature.getGeometry();

    if (newGeometry instanceof LineString) {
      // Siden OL er mutable og vi ikke ønsker å mutere den eksisterende geometrien
      const coordinates = [...newGeometry.getCoordinates()];
      const newCoordinates = coordinates.slice(startIndex, endIndex + 1);
      newFeature.setId(newFeatureId);
      newGeometry.setCoordinates(newCoordinates);
    }
    return newFeature;
  };

  const archiveOldFeature = (oldFeature: Feature<Geometry>) => {
    const properties = oldFeature.getProperties();
    const oldFeatureId = oldFeature.getId()?.toString();
    if (oldFeatureId == null) {
      return;
    }

    oldFeature.setProperties({ ...properties, shouldArchive: true });
    removeFeaturesFromSourceByIds("edit", [oldFeatureId]);

    // Hvis featuren som ble splittet er en gammel feature med ID ønsker vi å vise den som arkivert
    if (!isTempFeatureId(oldFeature.getId())) {
      addFeaturesToSource("archived", [oldFeature]);
    }
  };

  const performFeatureSplit = (featureToSplit: Feature<Geometry>, coordinatesToSplit: Coordinate[]) => {
    const features = createNewFeatures(featureToSplit, coordinatesToSplit);
    if (features == null) {
      return;
    }

    addFeaturesToSource("edit", features.newFeatures);
    archiveOldFeature(features.oldFeature);
    addHistoryEntry({
      type: "grensedeling",
      changes: [{ id: features.oldFeatureId, from: [features.oldFeature], to: features.newFeatures }],
    });
  };

  const split = () => {
    if (activeTool === "split" && selectedFeatures.length === 1 && selectedPoint) {
      const selectedPointGeometry = selectedPoint.getGeometry();
      if (selectedPointGeometry instanceof Point) {
        const coordinatesToSplit = selectedPointGeometry.getCoordinates();

        performFeatureSplit(selectedFeatures[0], [coordinatesToSplit]);
      }
    }
  };
  return { split, performFeatureSplit, createNewFeatures, archiveOldFeature };
};

export default useSplit;

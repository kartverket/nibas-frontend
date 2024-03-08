import LineString from "ol/geom/LineString";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { useToolbar } from "contexts/ToolbarContext";
import { Point } from "ol/geom";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { getTempFeatureId, isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { FeatureProperties } from "../../../types/api";
import { Coordinate } from "ol/coordinate";

// OBS! Per nå skiller denne seg fra de andre interaksjonene ved at den ikke legges til som et event i kartet
// I stedet bruker man select og selectPoint etter hverandre, og utløser handlingen ved en knapp i React
const useSplit = () => {
  const { addHistoryEntry } = useHistory();
  const { activeTool } = useToolbar();
  const { selectedFeatures, selectedPoint } = useFeatureStyle();

  const createCloneOfFeatureWithPartsOfCoordinates = (
    feature: Feature,
    startIndex: number,
    endIndex: number,
  ): Feature<Geometry> => {
    const newFeature = feature.clone();
    const newFeatureId = getTempFeatureId();
    const newGeometry = newFeature.getGeometry() as LineString;

    // Siden OL er mutable og vi ikke ønsker å mutere den eksisterende geometrien
    const coordinates = [...newGeometry.getCoordinates()];
    const newCoordinates = coordinates.splice(startIndex, endIndex);
    newFeature.setId(newFeatureId);
    newGeometry.setCoordinates(newCoordinates);
    return newFeature;
  };

  const performFeatureSplit = (featureToSplit: Feature<Geometry>, coordinatesToSplit: Coordinate) => {
    const oldFeature = featureToSplit;
    const oldGeometry = oldFeature.getGeometry();
    if (oldGeometry instanceof LineString) {
      const allFeatureCoordinates = oldGeometry.getCoordinates();
      const oldFeatureId = oldFeature.getId() as string;

      // Ikke vits å gjøre splitting med mindre du har en linje med minst tre punkter
      if (allFeatureCoordinates.length > 2) {
        const splitIndex = allFeatureCoordinates.findIndex(
          (v) => v[0] === coordinatesToSplit[0] && v[1] === coordinatesToSplit[1],
        );

        // Dette verifiserer at det valgte punktet er et gyldig punkt å splitte på grensen
        if (splitIndex > 0 && splitIndex < allFeatureCoordinates.length - 1) {
          const newFeature1 = createCloneOfFeatureWithPartsOfCoordinates(oldFeature, 0, splitIndex + 1);
          const newFeature2 = createCloneOfFeatureWithPartsOfCoordinates(
            oldFeature,
            splitIndex,
            allFeatureCoordinates.length,
          );

          const properties = oldFeature.getProperties() as FeatureProperties;
          oldFeature.setProperties({ ...properties, shouldArchive: true });
          addFeaturesToSource("edit", [newFeature1, newFeature2]);
          removeFeaturesFromSourceByIds("edit", [oldFeatureId]);
          addHistoryEntry({
            type: "grensedeling",
            changes: [{ id: oldFeatureId, from: [oldFeature], to: [newFeature1, newFeature2] }],
          });

          // Hvis featuren som ble splittet er en gammel feature med ID ønsker vi å vise den som arkivert
          if (!isTempFeatureId(oldFeatureId)) {
            addFeaturesToSource("archived", [oldFeature]);
          }
        }
      }
    }
  };

  const split = () => {
    if (activeTool === "split" && selectedFeatures.length === 1 && selectedPoint) {
      const selectedPointGeometry = selectedPoint.getGeometry();
      if (selectedPointGeometry instanceof Point) {
        const coordinatesToSplit = selectedPointGeometry.getCoordinates();

        performFeatureSplit(selectedFeatures[0], coordinatesToSplit);
      }
    }
  };
  return { split, performFeatureSplit };
};

export default useSplit;

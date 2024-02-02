import LineString from "ol/geom/LineString";
import { useHistory } from "contexts/HistoryContext";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { useToolbar } from "contexts/ToolbarContext";
import { Point } from "ol/geom";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { getTempFeatureId, isTempFeatureId } from "pages/Kart/interactions/tempFeatureIdUtil";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { FeatureProperties } from "../../../types/api";

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

  const split = () => {
    if (activeTool === "split" && selectedFeatures.length === 1 && selectedPoint) {
      const feature = selectedFeatures[0];
      const geometry = feature.getGeometry();
      if (geometry instanceof LineString) {
        const coordinates = geometry.getCoordinates();
        const featureId = feature.getId() as string;

        // Ikke vits å gjøre splitting med mindre du har en linje med minst tre punkter
        if (coordinates.length > 2) {
          const pointGeometry = selectedPoint.getGeometry();

          if (pointGeometry instanceof Point) {
            const coordinatesToSplit = pointGeometry.getCoordinates();
            const splitIndex = coordinates.findIndex(
              (v) => v[0] === coordinatesToSplit[0] && v[1] === coordinatesToSplit[1],
            );

            // Dette verifiserer at det valgte punktet er et gyldig punkt å splitte på grensen
            if (splitIndex > 0 && splitIndex < coordinates.length - 1) {
              const newFeature1 = createCloneOfFeatureWithPartsOfCoordinates(feature, 0, splitIndex + 1);
              const newFeature2 = createCloneOfFeatureWithPartsOfCoordinates(feature, splitIndex, coordinates.length);

              const properties = feature.getProperties() as FeatureProperties;
              feature.setProperties({ ...properties, shouldArchive: true });
              addFeaturesToSource("edit", [newFeature1, newFeature2]);
              addHistoryEntry({
                type: "grensesplitting",
                changes: [{ id: featureId, from: [feature], to: [newFeature1, newFeature2] }],
              });

              // Hvis featuren som ble splittet er en ny feature så ønsker vi ikke vise den som arkivert
              if (isTempFeatureId(featureId)) {
                removeFeaturesFromSourceByIds("edit", [featureId]);
              }
            }
          }
        }
      }
    }
  };
  return { split };
};

export default useSplit;

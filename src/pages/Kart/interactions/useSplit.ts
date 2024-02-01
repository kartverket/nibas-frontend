import LineString from "ol/geom/LineString";
import { useHistory } from "contexts/HistoryContext";
import { addFeaturesToSource } from "utils/map/source";
import { useToolbar } from "contexts/ToolbarContext";
import { Point } from "ol/geom";
import { useFeatureStyle } from "contexts/FeatureStyleContext";

// OBS! Per nå skiller denne seg fra de andre interaksjonene ved at den ikke legges til som et event i kartet
// I stedet bruker man select og selectPoint etter hverandre, og utløser handlingen ved en knapp i React
const useSplit = () => {
  const { addHistoryEntry } = useHistory();
  const { activeTool } = useToolbar();
  const { selectedFeatures, selectedPoint } = useFeatureStyle();

  const split = () => {
    if (
      activeTool === "split" &&
      selectedFeatures.length === 1 &&
      selectedPoint
    ) {
      const feature = selectedFeatures[0];
      const geometry = feature.getGeometry();
      if (geometry instanceof LineString) {
        const coordinates = geometry.getCoordinates();
        const featureId = feature.getId() as string;

        // Siden OL-objekter er mutable og vi trenger dette til senere:
        const originalCoordinates = [...coordinates];

        // Ikke vits å gjøre splitting med mindre du har en linje med minst tre punkter
        if (coordinates.length > 2) {
          const pointGeometry = selectedPoint.getGeometry();

          if (pointGeometry instanceof Point) {
            const coordinatesToSplit = pointGeometry.getCoordinates();
            const splitIndex = coordinates.findIndex(
              (v) =>
                v[0] === coordinatesToSplit[0] &&
                v[1] === coordinatesToSplit[1],
            );

            // Dette verifiserer at det valgte punktet er et gyldig punkt å splitte på grensen
            if (splitIndex > 0 && splitIndex < coordinates.length - 1) {
              // TODO: alt under denne kommentaren er spekulasjon på hvordan vi kanskje ønsker å gjøre det på sikt
              // per nå er ikke split faktisk brukbart uten backend uansett, så det er bare et forslag
              const clonedFeature = feature.clone();
              const clonedFeatureId = `${featureId}-clone`;
              const clonedGeometry = clonedFeature.getGeometry() as LineString;
              const clonedCoordinates = clonedGeometry.getCoordinates();
              clonedFeature.setId(clonedFeatureId);

              const headCoordinates = coordinates.splice(0, splitIndex + 1);
              const tailCoordinates = clonedCoordinates.splice(splitIndex);

              geometry.setCoordinates(headCoordinates);
              clonedGeometry.setCoordinates(tailCoordinates);

              addFeaturesToSource("edit", [clonedFeature]);

              if (featureId && clonedFeatureId) {
                addHistoryEntry({
                  type: "grense",
                  changes: [
                    {
                      id: featureId,
                      from: { coordinates: originalCoordinates },
                      to: { coordinates },
                    },
                    {
                      id: clonedFeatureId,
                      from: { coordinates: [] },
                      to: { coordinates: clonedCoordinates },
                    },
                  ],
                });
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

import { useMemo } from "react";
import { Draw } from "ol/interaction";
import { editSource } from "hooks/layers/constants";
import { pixelTolerance } from "./constants";
import { dirtyStyles } from "utils/map/layerStyles";
import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import { useToolbarSaving } from "contexts/ToolbarContext";
import { setEmptyFeatureProperties } from "utils/api";
import { useEditAllGrenser } from "contexts/EditGrenserContext";

// TODO: skru av evnen til å dra når man er i tegnemodus.
const useDrawInteraction = () => {
  const { addEntry } = useToolbarSaving();
  const { getCurrentEditingType } = useEditAllGrenser();
  const editingType = getCurrentEditingType();

  const draw = useMemo(
    () =>
      new Draw({
        source: editSource,
        type: "LineString",
        stopClick: true,
        snapTolerance: pixelTolerance, // TODO: denne fungerer ikke når man ønsker å ende linjen på et linje og lage nytt punkt
        style: dirtyStyles,
        condition: () => editingType !== null,
      }),
    [editingType]
  );

  draw.on("drawend", (event) => {
    const feature = event.feature as Feature<LineString>;

    // Denne vil i praksis alltid gå gjennom fordi vi må være i redigeringsmodus for å kunne tegne
    if (editingType) {
      setEmptyFeatureProperties(feature, editingType);
      const geometry = feature.getGeometry();
      if (geometry) {
        // TODO: per nå får man uendelig undos, fikser det med ny historytype senere ("grense" blir nok ikke riktig)
        addEntry({
          type: "grense",
          changes: [
            {
              id: feature.getId() as string,
              from: [],
              to: geometry.getCoordinates(),
            },
          ],
        });
      }
    }
  });
  // TODO: Ta en runde med backend på hva nye linjer skal ha av metadata

  // TODO: Nye linjer som starter i endepunkter (coordinates[0] eller coordinates[-1]) skal oppleves som en utvidelse
  // utvidelser skal heller legge til koordinater på eksisterende linje, det er mulig edit-interaksjoner har noe for dette?
  return { draw };
};

export default useDrawInteraction;

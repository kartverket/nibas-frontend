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

// TODO-lav: skru av evnen til å dra når man er i tegnemodus.
const useDrawInteraction = () => {
  const { addEntry } = useToolbarSaving();
  const { getCurrentEditingType } = useEditAllGrenser();
  const editingType = getCurrentEditingType();

  // TODO-lav: skru av det at man kan tegne fra hvor som helst på kartet, må starte på en eksisterende feature?
  const draw = useMemo(
    () =>
      new Draw({
        source: editSource,
        type: "LineString",
        stopClick: true,
        snapTolerance: pixelTolerance, // TODO-lav: denne snapper ikke når man ønsker å ende linjen på et linje og lage nytt punkt
        style: dirtyStyles,
        condition: () => editingType !== null,
      }),
    [editingType]
  );

  draw.on("drawend", (event) => {
    const feature = event.feature as Feature<LineString>;

    // Denne vil i praksis alltid gå gjennom ettersom man må være i redigeringsmodus for å kunne tegne
    if (editingType) {
      setEmptyFeatureProperties(feature, editingType);
      const geometry = feature.getGeometry();
      if (geometry) {
        // TODO-mid: per nå får man uendelig undos, fikser det med ny historytype senere ("grense" blir nok ikke riktig)
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
  // TODO-mid: Verifiser hvor viktig dette er fordi denne er stor:
  // Nye linjer som starter i endepunkter (coordinates[0] eller coordinates[-1]) skal oppleves som en utvidelse
  // utvidelser skal heller legge til koordinater på eksisterende linje, det er mulig edit-interaksjoner har noe for dette?
  // Dette utgår kanskje ettersom vi ikke har noen løse linjer som jeg vet om

  // TODO-mid: Verifiser hvordan dette skal fungere
  // Hvis jeg starter eller slutter en linje på en annen linje og da lager et nytt punkt, så skal det bli et nytt punkt på linjen også
  // Dette blir altså noe jeg må sjekke og kjøre både ved drawstart og drawend
  // Merk at dette må da også splitte linjen, og da er vi tilbake til å være avhengig av matrikkelalgoritmene

  // TODO-høy: Ta en runde med backend på hva nye linjer skal ha av metadata
  return { draw };
};

export default useDrawInteraction;

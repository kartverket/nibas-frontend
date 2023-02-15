import { useMemo } from "react";
import { Draw } from "ol/interaction";
import { editSource } from "hooks/layers/constants";
import { pixelTolerance } from "./constants";
import { dirtyStyles } from "utils/map/layerStyles";

// TODO: skru av evnen til å dra når man er i tegnemodus.
const useDrawInteraction = () => {
  const draw = useMemo(
    () =>
      new Draw({
        source: editSource,
        type: "LineString",
        stopClick: true,
        // TODO: bør har en condition som krever at man starter på et eksisterende punkt
        snapTolerance: pixelTolerance, // TODO: denne fungerer ikke når man ønsker å ende linjen på et linje og lage nytt punkt
        style: dirtyStyles,
        // TODO: style for å fjerne prikkmarkør, bruk dirtystyle også?
      }),
    []
  );

  // TODO: Ta en runde med backend på hva nye linjer skal ha av metadata

  // TODO: Nye linjer som starter i endepunkter (coordinates[0] eller coordinates[-1]) skal oppleves som en utvidelse
  // utvidelser skal heller legge til koordinater på eksisterende linje, det er mulig edit-interaksjoner har noe for dette?

  // TODO: tegning må legge til entries i history, trenger trolig ny type entry?

  // TODO: denne bør interagere med useDirtyStyle på en eller annen måte sikkert
  return { draw };
};

export default useDrawInteraction;

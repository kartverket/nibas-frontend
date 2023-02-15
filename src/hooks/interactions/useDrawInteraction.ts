import { useMemo } from "react";
import { Draw } from "ol/interaction";
import { editSource } from "hooks/layers/constants";
import { pixelTolerance } from "./constants";

// TODO: skru av evnen til å dra når man er i tegnemodus.
const useDrawInteraction = () => {
  const draw = useMemo(
    () =>
      new Draw({
        source: editSource,
        type: "LineString",
        stopClick: true,
        snapTolerance: pixelTolerance,
        // TODO: style for å fjerne prikkmarkør, bruk dirtystyle også?
      }),
    []
  );

  // TODO: denne bør interagere med useDirtyStyle på en eller annen måte sikkert
  return { draw };
};

export default useDrawInteraction;

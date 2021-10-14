import { Sources } from "hooks/sources/types";
import { Draw, Modify, Snap } from "ol/interaction";
import { useMemo } from "react";
import useInteraction from "./useInteraction";

const useInteractions = (sources: Sources, shouldAddInteractions: boolean) => {
  const vectorModify = useMemo(
    () =>
      sources.kommuner &&
      new Modify({
        source: sources.kommuner,
      }),
    [sources.kommuner]
  );
  const vectorDraw = useMemo(
    () =>
      sources.kommuner &&
      new Draw({
        source: sources.kommuner,
        type: "Polygon",
      }),
    [sources.kommuner]
  );
  const vectorSnap = useMemo(
    () => sources.kommuner && new Snap({ source: sources.kommuner }),
    [sources.kommuner]
  );

  useInteraction(vectorModify, shouldAddInteractions);
  useInteraction(vectorDraw, shouldAddInteractions);
  useInteraction(vectorSnap, shouldAddInteractions);
};

export default useInteractions;

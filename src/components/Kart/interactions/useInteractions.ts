import { map } from "components/Kart/constants";
import { Snap } from "ol/interaction";
import { useEffect } from "react";
import { getVectorLayers } from "utils/map/layers";
import useModify from "./useModify";
import useSelect from "./useSelect";
import useSplit from "./useSplit";
import useSelectPoint from "./useSelectPoint";
import { useToolbar } from "contexts/ToolbarContext";

const useInteractions = () => {
  const { modify } = useModify();
  const { select } = useSelect();
  const { activeEditModes } = useToolbar();
  const { split } = useSplit();
  const { selectPoint } = useSelectPoint();

  useEffect(() => {
    const vectorLayers = getVectorLayers();
    const snaps: Snap[] = [];

    vectorLayers.forEach((layer) => {
      const source = layer.getSource();
      const snap = new Snap({ source });
      snaps.push(snap);
    });

    // Rekkefølgen her er potensielt viktig for at events skal avbryte hverandre i riktig rekkefølge
    map.on("click", split);
    map.on("click", select);
    map.on("click", selectPoint);
    map.addInteraction(modify);

    // snaps må legges til etter modify og draw interactions
    if (activeEditModes.includes("snap")) {
      snaps.forEach((snap) => {
        map.addInteraction(snap);
      });
    }

    return () => {
      map.un("click", split);
      map.un("click", select);
      map.un("click", selectPoint);
      map.removeInteraction(modify);
      snaps.forEach((snap) => {
        map.removeInteraction(snap);
      });
    };
  }, [activeEditModes, modify, select, selectPoint, split]);
};

export default useInteractions;

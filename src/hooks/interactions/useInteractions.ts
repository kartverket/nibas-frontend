import { useEffect } from "react";
import { Draw, Modify, Snap } from "ol/interaction";
import { GeometryVectorSource } from "hooks/sources/types";
import { map } from "components/Map/constants";

const useInteractions = (
  source: GeometryVectorSource | undefined,
  shouldAddInteractions: boolean
) => {
  useEffect(() => {
    if (!source || !shouldAddInteractions) return;

    const modify = new Modify({ source });
    const draw = new Draw({ type: "Polygon", source });
    const snap = new Snap({ source });

    map.addInteraction(modify);
    map.addInteraction(draw);
    map.addInteraction(snap);

    return () => {
      map.removeInteraction(modify);
      map.removeInteraction(draw);
      map.removeInteraction(snap);
    };
  }, [source, shouldAddInteractions]);
};

export default useInteractions;

import { useEffect } from "react";
import { Draw, Modify, Snap } from "ol/interaction";
import { useMap } from "components/Map/MapContext";
import { GeometryVectorSource } from "hooks/sources/types";

const useInteractions = (
  source: GeometryVectorSource | undefined,
  shouldAddInteractions: boolean
) => {
  const { map } = useMap();

  useEffect(() => {
    if (!map || !shouldAddInteractions) return;

    if (!source) return;

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
  }, [map, source, shouldAddInteractions]);
};

export default useInteractions;

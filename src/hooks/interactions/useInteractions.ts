import { useEffect } from "react";
import { Draw, Modify, Select, Snap } from "ol/interaction";
import { GeometryVectorSource } from "hooks/sources/types";
import { map } from "components/Map/constants";

const useInteractions = (
  source: GeometryVectorSource | undefined,
  editing: boolean
) => {
  useEffect(() => {
    if (!editing || !source) return;

    const modify = new Modify({ source });
    const draw = new Draw({
      type: "LineString",
      source,
    });
    const snap = new Snap({ source });

    map.addInteraction(modify);
    map.addInteraction(draw);
    map.addInteraction(snap);

    return () => {
      map.removeInteraction(modify);
      map.removeInteraction(draw);
      map.removeInteraction(snap);
    };
  }, [editing, source]);

  useEffect(() => {
    if (editing) return;

    const select = new Select({ hitTolerance: 5 });

    // valgte features er lagret i select.getFeatures()

    map.addInteraction(select);

    return () => {
      map.removeInteraction(select);
    };
  }, [editing]);
};

export default useInteractions;

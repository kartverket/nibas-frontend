import { useEffect } from "react";
import { Draw, Modify, Select, Snap } from "ol/interaction";
import { map } from "components/Map/constants";
import { getLayerById } from "utils/map/layers";

const useEditInteractions = (editing: boolean) => {
  useEffect(() => {
    if (!editing) return;

    const editSource = getLayerById("edit").getSource();

    const modify = new Modify({ source: editSource });
    const draw = new Draw({
      type: "LineString",
      source: editSource,
    });
    const snap = new Snap({ source: editSource });

    map.addInteraction(modify);
    map.addInteraction(draw);
    map.addInteraction(snap);

    return () => {
      map.removeInteraction(modify);
      map.removeInteraction(draw);
      map.removeInteraction(snap);
    };
  }, [editing]);

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

export default useEditInteractions;

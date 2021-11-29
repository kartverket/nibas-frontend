import { useEffect } from "react";
import { Draw, Modify, Select, Snap } from "ol/interaction";
import { map } from "components/Map/constants";
import { getLayerById, getVectorLayers } from "utils/map/layers";

const useEditInteractions = (editing: boolean) => {
  useEffect(() => {
    if (!editing) return;

    const editSource = getLayerById("edit").getSource();

    const modify = new Modify({ source: editSource });
    const draw = new Draw({
      type: "LineString",
      source: editSource,
    });

    map.addInteraction(modify);
    map.addInteraction(draw);

    return () => {
      map.removeInteraction(modify);
      map.removeInteraction(draw);
    };
  }, [editing]);

  // snaps må legges til etter modify og draw for å funke ordentlig
  useEffect(() => {
    const vectorLayers = getVectorLayers();
    const snaps: Snap[] = [];

    vectorLayers.forEach((layer) => {
      const source = layer.getSource();

      const snap = new Snap({ source });

      snaps.push(snap);
    });

    snaps.forEach((snap) => {
      map.addInteraction(snap);
    });

    return () => {
      snaps.forEach((snap) => {
        map.removeInteraction(snap);
      });
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

import { useEffect } from "react";
import { Modify, Snap } from "ol/interaction";
import Style from "ol/style/Style";
import { map } from "components/Kart/constants";
import { getLayerById, getVectorLayers } from "utils/map/layers";

const useEditInteractions = () => {
  useEffect(() => {
    const vectorLayers = getVectorLayers();
    const snaps: Snap[] = [];

    vectorLayers.forEach((layer) => {
      const source = layer.getSource();

      const snap = new Snap({ source });

      snaps.push(snap);
    });

    const editSource = getLayerById("edit").getSource();

    const modify = new Modify({
      source: editSource,
      style: new Style({}), // fjerne sirkel som kommer når man hoverer feature
    });

    map.addInteraction(modify);
    // snaps må legges til etter modify og draw interactions
    snaps.forEach((snap) => {
      map.addInteraction(snap);
    });

    return () => {
      map.removeInteraction(modify);
      snaps.forEach((snap) => {
        map.removeInteraction(snap);
      });
    };
  }, []);
};

export default useEditInteractions;

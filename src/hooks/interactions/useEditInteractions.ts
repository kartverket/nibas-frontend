import { useCallback, useEffect, useState } from "react";
import { Modify, Snap } from "ol/interaction";
import Style from "ol/style/Style";
import { map } from "components/Kart/constants";
import { getLayerById, getVectorLayers } from "utils/map/layers";
import { dirtyPointStyle, dirtyStyle } from "utils/map/layerStyles";

const useEditInteractions = () => {
  const [dirtyFeatureIds, setDirtyFeatureIds] = useState<string[]>([]);

  const updateDirtyFeatureIds = useCallback((featureId: string) => {
    setDirtyFeatureIds((prevDirtyFeatureIds) => {
      if (!prevDirtyFeatureIds.includes(featureId)) {
        return [...prevDirtyFeatureIds, featureId];
      }

      return prevDirtyFeatureIds;
    });
  }, []);

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

    modify.on("modifyend", (e) => {
      e.features.forEach((featureLike) => {
        const featureId = featureLike.getId();

        if (!featureId) return;

        updateDirtyFeatureIds(featureId as string);

        getLayerById("edit")
          .getSource()
          .getFeatureById(featureId)
          .setStyle([dirtyStyle, dirtyPointStyle]);
      });
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
  }, [updateDirtyFeatureIds]);

  return dirtyFeatureIds;
};

export default useEditInteractions;

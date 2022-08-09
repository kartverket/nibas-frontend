import { useEffect, useMemo, useState } from "react";
import LineString from "ol/geom/LineString";
import { Modify, Snap } from "ol/interaction";
import { ModifyEvent } from "ol/interaction/Modify";
import Style from "ol/style/Style";
import { map } from "components/Kart/constants";
import { editSource } from "hooks/layers/constants";
import { getVectorLayers } from "utils/map/layers";
import { dirtyStyles, editStyles } from "utils/map/layerStyles";

const modify = new Modify({
  source: editSource,
  style: new Style({}), // fjerne sirkel som kommer når man hoverer feature
});

// liste med koordinater, hvor 0 er eldst og n er nyeste versjon
type FeatureHistory = Record<string, number[][][]>;

const useEditInteractions = () => {
  const [history, setHistory] = useState<FeatureHistory>({});

  useEffect(() => {
    const vectorLayers = getVectorLayers();
    const snaps: Snap[] = [];

    vectorLayers.forEach((layer) => {
      const source = layer.getSource();

      const snap = new Snap({ source });

      snaps.push(snap);
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

  useEffect(() => {
    const addInitialFeaturesToHistory = (e: ModifyEvent) => {
      e.features.forEach((featureLike) => {
        const featureId = featureLike.getId();

        if (!featureId) return;

        setHistory((prevHistory) => {
          if (prevHistory[featureId]?.length > 0) return prevHistory;

          const geometry = featureLike.getGeometry() as LineString;
          const initialCoordinates = geometry.getCoordinates();

          if (!initialCoordinates) return prevHistory;

          return {
            [featureId]: [initialCoordinates],
          };
        });
      });
    };

    modify.on("modifystart", addInitialFeaturesToHistory);
  }, []);

  useEffect(() => {
    const addCoordinatesToHistory = (e: ModifyEvent) => {
      e.features.forEach((featureLike) => {
        const featureId = featureLike.getId();

        if (!featureId) return;

        const geometry = featureLike.getGeometry() as LineString;
        const newCoordinates = geometry.getCoordinates();

        if (!newCoordinates) return;

        setHistory((prevHistory) => ({
          ...prevHistory,
          [featureId]: [...prevHistory[featureId], newCoordinates],
        }));
      });
    };

    modify.on("modifyend", addCoordinatesToHistory);
  }, []);

  useEffect(() => {
    const setDirtyStyleOnEditedFeature = (e: ModifyEvent) => {
      e.features.forEach((featureLike) => {
        const featureId = featureLike.getId();

        if (!featureId) return;

        editSource.getFeatureById(featureId).setStyle(dirtyStyles);
      });
    };

    modify.on("modifyend", setDirtyStyleOnEditedFeature);
  }, []);

  useEffect(() => {
    console.log(history);
  }, [history]);

  const dirtyFeatureIds = useMemo(() => Object.keys(history), [history]);

  const clearHistory = () => {
    Object.keys(history).forEach((featureId) => {
      editSource.getFeatureById(featureId).setStyle(editStyles);
    });

    setHistory({});
  };

  return {
    dirtyFeatureIds,
    clearHistory,
  };
};

export default useEditInteractions;

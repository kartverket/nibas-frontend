import { useContext, useEffect, useMemo, useState } from "react";
import { Draw, Interaction, Modify, Snap } from "ol/interaction";
import MapContext from "../Map/MapContext";
import Geometry from "ol/geom/Geometry";
import VectorSource from "ol/source/Vector";
import { DrawEvent } from "ol/interaction/Draw";

const useInteraction = (interaction: Interaction) => {
  const map = useContext(MapContext);

  useEffect(() => {
    if (!map) return;

    map.addInteraction(interaction);

    return () => {
      map.removeInteraction(interaction);
    };
  }, [map, interaction]);
};

export const useModifyInteraction = (vectorSource: VectorSource<Geometry>) => {
  const modify = useMemo(
    () =>
      new Modify({
        source: vectorSource,
      }),
    [vectorSource]
  );

  // alt-click deletes
  useInteraction(modify);
};

export const useDrawInteraction = (vectorSource: VectorSource<Geometry>) => {
  const [newFeatureId, setNewFeatureId] = useState(0);
  const draw = useMemo(
    () =>
      new Draw({
        source: vectorSource,
        type: "Polygon",
      }),
    [vectorSource]
  );

  const snap = useMemo(
    () => new Snap({ source: vectorSource }),
    [vectorSource]
  );

  useEffect(() => {
    const onDrawEnd = (e: DrawEvent) => {
      // adds drawing to the vector source
      e.feature.setId("nibas-" + newFeatureId);
      setNewFeatureId(newFeatureId + 1);
      vectorSource.addFeature(e.feature);
    };

    draw.on("drawend", onDrawEnd);

    return () => {
      draw.un("drawend", onDrawEnd);
    };
  }, [draw, vectorSource, newFeatureId]);

  useInteraction(draw);
  useInteraction(snap);
};

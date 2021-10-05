import { useEffect, useMemo } from "react";
import { Draw, Interaction, Modify, Snap } from "ol/interaction";
import Geometry from "ol/geom/Geometry";
import VectorSource from "ol/source/Vector";
import { useMap } from "components/Map/MapContext";

const useInteraction = (interaction: Interaction, enabled = true) => {
  const { map } = useMap();

  useEffect(() => {
    if (!map || !enabled) return;

    map.addInteraction(interaction);

    return () => {
      map.removeInteraction(interaction);
    };
  }, [map, interaction, enabled]);
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

  useInteraction(draw);
  useInteraction(snap);
};

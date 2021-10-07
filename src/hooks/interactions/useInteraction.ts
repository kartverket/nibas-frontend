import { useEffect } from "react";
import { Interaction } from "ol/interaction";
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

export default useInteraction;

import { useState } from "react";

const useVisibleSubLayers = () => {
  const [visibleSubLayers, setVisibleSubLayers] = useState<string[]>([]);

  const toggleSubLayerVisibility = (layerId: string) => {
    if (visibleSubLayers.includes(layerId)) {
      setVisibleSubLayers(visibleSubLayers.filter((vsl) => vsl !== layerId));
    } else {
      setVisibleSubLayers([layerId, ...visibleSubLayers]);
    }
  };

  return { visibleSubLayers, toggleSubLayerVisibility };
};

export default useVisibleSubLayers;

import { useEffect, useState } from "react";
import { bakgrunnskartLayers } from "./constants";
import { BakgrunnskartId } from "./types";
import { getLayerById } from "utils/map/layers";
import { MappedLayer } from "utils/getLayersFromWMS";

export type VisibleLayer = {
  mainLayer: BakgrunnskartId;
  subLayers: string[];
};

const useVisibleLayers = () => {
  const [visibleLayers, setVisibleLayers] = useState<VisibleLayer[]>([
    {
      mainLayer: "cachetjenester" as BakgrunnskartId,
      subLayers: ["Norges grunnkart gråtone"],
    },
  ]);
  // sett synlighet til layer i map til ny verdi
  useEffect(() => {
    for (const bakgrunnsLayer of Object.keys(bakgrunnskartLayers)) {
      const layer = getLayerById(bakgrunnsLayer as BakgrunnskartId);
      layer?.setVisible(false);
    }

    visibleLayers.forEach((visibleLayer, i) => {
      const layer = getLayerById(visibleLayer.mainLayer as BakgrunnskartId);
      layer?.setVisible(true);
      layer.setZIndex(-i - 1);
    });
  }, [visibleLayers]);

  const toggleLayerVisibility = (
    layerId: BakgrunnskartId,
    subLayer?: string
  ) => {
    if (!subLayer) {
      toggleLayerWithOutSublayer(layerId);
      return;
    }
    const layer = visibleLayers.find(
      (visibleLayer) => visibleLayer.mainLayer === layerId
    );

    const subLayerVisible = layer?.subLayers.includes(subLayer);

    if (!layer) {
      setVisibleLayers([
        { mainLayer: layerId, subLayers: [subLayer] },
        ...visibleLayers,
      ]);
      return;
    }
    //treffer når du skal fjerne et sublag
    if (subLayerVisible) {
      if (layer.subLayers.length === 1) {
        setVisibleLayers(visibleLayers.filter((vl) => vl !== layer));
        return;
      }
      const filteredSublayers = layer.subLayers.filter((sl) => sl !== subLayer);
      const index = visibleLayers.findIndex((vl) => vl.mainLayer === layerId);
      setVisibleLayers([
        ...visibleLayers.slice(0, index),
        { mainLayer: layerId, subLayers: filteredSublayers },
        ...visibleLayers.slice(index + 1),
      ]);
    } else if (layer && !subLayerVisible) {
      //skal treffe når man skal legge til sublag på et eksisterende aktivt hovedlag

      const newSublayers = layer.subLayers.concat(subLayer);
      const index = visibleLayers.findIndex((vl) => vl.mainLayer === layerId);
      setVisibleLayers([
        ...visibleLayers.slice(0, index),
        { mainLayer: layerId, subLayers: newSublayers },
        ...visibleLayers.slice(index + 1),
      ]);
    }
  };

  const toggleLayerWithOutSublayer = (layerId: BakgrunnskartId) => {
    let layer = visibleLayers.find(
      (visibleLayer) => visibleLayer.mainLayer === layerId
    );

    const visible = layer ? true : false;

    if (visible) {
      setVisibleLayers(visibleLayers.filter((vl) => vl !== layer));
    } else {
      layer = { mainLayer: layerId, subLayers: [] };
      setVisibleLayers([layer, ...visibleLayers]);
    }
  };

  const layerIsVisible = (layerId: BakgrunnskartId) => {
    return visibleLayers.some(
      (visibleLayer) => visibleLayer.mainLayer === layerId
    );
  };

  const subLayerIsVisible = (mainLayer: BakgrunnskartId, subLayer: string) => {
    return visibleLayers.some(
      (visibleLayer) =>
        visibleLayer.mainLayer === mainLayer &&
        visibleLayer.subLayers.includes(subLayer)
    );
  };

  const moveLayer = (direction: "up" | "down", layerId: BakgrunnskartId) => {
    const layer = visibleLayers.find(
      (visibleLayer) => visibleLayer.mainLayer === layerId
    );

    if (layer) {
      const indexDifference = direction === "up" ? 1 : -1;
      const index = visibleLayers.indexOf(layer);
      const newZIndexes = [...visibleLayers];
      newZIndexes.splice(index, 1);
      newZIndexes.splice(index + indexDifference, 0, layer);

      setVisibleLayers(newZIndexes);
    }
  };

  const recursiveIsVisible = (
    mainLayer: BakgrunnskartId,
    layer: MappedLayer
  ): boolean => {
    if (subLayerIsVisible(mainLayer, layer.title)) {
      return true;
    }
    if (layer.layers.length > 0) {
      for (const subLayer of layer.layers) {
        if (recursiveIsVisible(mainLayer, subLayer)) {
          return true;
        }
      }
    }
    return false;
  };

  return {
    visibleLayers,
    moveLayer,
    toggleLayerVisibility,
    layerIsVisible,
    subLayerIsVisible,
    recursiveIsVisible,
  };
};

export default useVisibleLayers;

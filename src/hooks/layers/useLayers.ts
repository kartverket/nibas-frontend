import { useEffect, useState } from "react";
import Layer from "ol/layer/Layer";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Source from "ol/source/Source";
import { Sources } from "hooks/sources/types";
import { useLayer } from "./useLayer";
import { ByLayerId } from "./types";
import { VisibleLayers } from "./useVisibleLayers";

type LayersById = ByLayerId<Layer<Source> | undefined>;

const useLayers = (sources: Sources, visibleLayers: VisibleLayers) => {
  const [layers, setLayers] = useState<LayersById>(() => ({
    administrativeGrenser: new TileLayer({
      source: sources.administrativeGrenser,
    }),
    background: new TileLayer({ source: sources.background }),
    vector: new VectorLayer({ source: sources.vector }),
    fylker: undefined,
    kommuner: undefined,
  }));

  useEffect(() => {
    if (!sources.fylker) return;

    setLayers((prevLayers) => ({
      ...prevLayers,
      fylker: new VectorLayer({ source: sources.fylker }),
    }));
  }, [sources.fylker]);

  useEffect(() => {
    if (!sources.kommuner) return;

    setLayers((prevLayers) => ({
      ...prevLayers,
      kommuner: new VectorLayer({ source: sources.kommuner, minZoom: 9 }),
    }));
  }, [sources.kommuner]);

  useLayer("background", layers.background, visibleLayers.background);
  useLayer(
    "administrativeGrenser",
    layers.administrativeGrenser,
    visibleLayers.administrativeGrenser
  );
  useLayer("kommuner", layers.kommuner, visibleLayers.kommuner);
  useLayer("fylker", layers.fylker, visibleLayers.fylker);
  useLayer("vector", layers.vector, visibleLayers.vector);
};

export default useLayers;

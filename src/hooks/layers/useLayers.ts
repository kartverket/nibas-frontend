import { useLayer } from "./useLayer";
import { administrativeEnheterSource, tileSource, vectorSource } from "sources";
import { useMemo } from "react";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";

const useLayers = () => {
  const backgroundLayer = useMemo(
    () => new TileLayer({ source: tileSource }),
    []
  );
  useLayer(backgroundLayer);

  const administrativeEnheterLayer = useMemo(
    () => new TileLayer({ source: administrativeEnheterSource }),
    []
  );
  useLayer(administrativeEnheterLayer);

  const vectorLayer = useMemo(
    () => new VectorLayer({ source: vectorSource }),
    []
  );
  useLayer(vectorLayer);
};

export default useLayers;

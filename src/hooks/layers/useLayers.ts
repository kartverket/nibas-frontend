import { useEffect } from "react";
import Layer from "ol/layer/Layer";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Source from "ol/source/Source";
import { Sources } from "hooks/sources/types";
import { ByLayerId, LayerId } from "./types";
import { useMap } from "components/Map/MapContext";
import { getLayersArray, layerExistsInMap } from "utils/map/layers";

type LayersById = ByLayerId<Layer<Source> | undefined>;

const useLayers = (sources: Sources) => {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const layers: LayersById = {
      administrativeGrenser: new TileLayer({
        source: sources.administrativeGrenser,
      }),
      background: new TileLayer({ source: sources.background }),
      vector: new VectorLayer({ source: sources.vector }),
      fylker: sources.fylker && new VectorLayer({ source: sources.fylker }),
      kommuner:
        sources.kommuner &&
        new VectorLayer({ source: sources.kommuner, minZoom: 11 }),
      matrikkelen: new TileLayer({ source: sources.matrikkelen }),
      stedsnavn: new TileLayer({ source: sources.stedsnavn }),
    };

    Object.keys(layers).forEach((layerId) => {
      const layer = layers[layerId as LayerId];

      if (!layer) return;

      if (!layerExistsInMap(map, layerId as LayerId)) {
        layer.set("id", layerId);
        map.addLayer(layer);
      }
    });
  }, [map, sources]);

  // fjern layers når map unmountes
  useEffect(() => {
    if (!map) return;

    return () => {
      const layers = getLayersArray(map);
      layers.forEach((layer) => {
        map.removeLayer(layer);
      });
    };
  }, [map]);
};

export default useLayers;

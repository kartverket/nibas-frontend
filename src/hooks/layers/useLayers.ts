import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { useLayer } from "./useLayer";
import { administrativeEnheterSource, tileSource, vectorSource } from "sources";

const backgroundLayer = new TileLayer({ source: tileSource });
const administrativeEnheterLayer = new TileLayer({
  source: administrativeEnheterSource,
});
const vectorLayer = new VectorLayer({ source: vectorSource });

const useLayers = () => {
  useLayer("background", backgroundLayer);
  useLayer("administrativeGrenser", administrativeEnheterLayer);
  useLayer("vector", vectorLayer);
};

export default useLayers;

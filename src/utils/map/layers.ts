import { grenserLayers, kartlagLayers } from "hooks/layers/constants";
import { LayerId } from "hooks/layers/types";
import { WFS } from "ol/format";
import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import WMTS from "ol/source/WMTS";
import { map } from "pages/Kart/constants";
import { getFeaturesFromGeoJson } from "./geoJson";
import { defaultProjectionEpsgCode } from "./projections";
import { addFeaturesToSource } from "./source";

const getLayersArray = () => map.getLayers().getArray() ?? [];

export const getLayerById = <T extends LayerId>(id: T) => {
  const layersWithId = getLayersArray().filter((layer) => layer.get("id") === id);

  if (layersWithId.length !== 1) {
    throw new Error(
      `Fant ${layersWithId.length} lag med id ${id}. Sjekk funksjonen som oppretter og setter inn lag i kartet`,
    );
  }

  return layersWithId[0] as (typeof kartlagLayers & typeof grenserLayers)[T];
};

export const getVectorLayers = () => {
  const layers = getLayersArray();

  return layers.filter((layer) => layer instanceof VectorLayer) as VectorLayer<VectorSource>[];
};

export const isWMTSLayer = (layer: BaseLayer): layer is TileLayer<WMTS> => {
  return layer instanceof TileLayer && layer.getSource() instanceof WMTS;
};

export const isWMSLayer = (layer: BaseLayer): layer is TileLayer<TileWMS> => {
  return layer instanceof TileLayer && layer.getSource() instanceof TileWMS;
};

export const getMatrikkelFeatures = async () => {
  const extent = map.getView().calculateExtent(map.getSize());
  const request: Node = new WFS({ version: "2.0.0" }).writeGetFeature({
    srsName: defaultProjectionEpsgCode,
    featureNS: "http://www.statkart.no/matrikkel",
    featurePrefix: "matrikkel",
    featureTypes: ["TEIGGRENSEWFS"],
    outputFormat: "application/json",
    bbox: extent,
    geometryName: "KURVE",
  });

  try {
    const response = await fetch("/geoservergeo/wfs/matrikkel", {
      method: "POST",
      body: new XMLSerializer().serializeToString(request),
    });
    if (!response.ok) throw new Error("Feil i response: " + response);

    const json = await response.json();
    const fetchedFeatures = getFeaturesFromGeoJson(json);
    if (fetchedFeatures.length > 0) {
      clearMatrikkelLayer();
      addFeaturesToSource("matrikkel", fetchedFeatures);
      return fetchedFeatures;
    }
  } catch {
    return;
  }
};

export const clearMatrikkelLayer = () => {
  const source = grenserLayers.matrikkel.getSource();

  if (source) {
    source.clear();
    return true;
  }

  return false;
};

import { grenserLayers, kartlagLayers } from "hooks/layers/constants";
import { GrenseId, LayerId } from "hooks/layers/types";
import { Feature } from "ol";
import { WFS } from "ol/format";
import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import WMTS from "ol/source/WMTS";
import { map } from "pages/Kart/constants";
import { getFeaturesFromGeoJson } from "./geoJson";
import { mapProjectionEPSGCode } from "./projections";
import { addFeaturesToSource } from "./source";
import { LineString } from "ol/geom";
import { roundToNearestHalf } from "pages/Kart/OverlayPanels/NavigasjonPanel/koordinater-utils";

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

export const getAllViewingLayers = (): VectorLayer<VectorSource<Feature>>[] => {
  const viewingLayerIds: GrenseId[] = ["fylke", "grunnkrets", "stemmekrets", "kommune", "nasjon", "bopliktomraade"];
  return getLayersArray()
    .filter((l) => isVectorLayer(l))
    .filter((l) => viewingLayerIds.includes(l.get("id")));
};

export const clearViewingLayers = () => {
  for (const layer of getAllViewingLayers()) {
    layer.getSource()?.clear();
  }
};

export const clearEditLayer = () => getLayerById("edit").getSource()?.clear();

export const isWMTSLayer = (layer: BaseLayer): layer is TileLayer<WMTS> => {
  return layer instanceof TileLayer && layer.getSource() instanceof WMTS;
};

export const isWMSLayer = (layer: BaseLayer): layer is TileLayer<TileWMS> => {
  return layer instanceof TileLayer && layer.getSource() instanceof TileWMS;
};

export const isVectorLayer = (layer: BaseLayer): layer is VectorLayer<VectorSource<Feature>> => {
  return layer instanceof VectorLayer && layer.getSource() instanceof VectorSource;
};

export const getMatrikkelFeatures = async () => {
  const extent = map.getView().calculateExtent(map.getSize());
  const request: Node = new WFS({ version: "2.0.0" }).writeGetFeature({
    srsName: mapProjectionEPSGCode,
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
    if (!response.ok) {
      throw new Error("Feil i response: " + response);
    }

    const json = await response.json();
    const fetchedFeatures = getFeaturesFromGeoJson(json);
    if (fetchedFeatures.length > 0) {
      clearMatrikkelLayer();
      // avrund alle koordinater til 3 desimaler via roundToNearestHalf
      fetchedFeatures.forEach((feature) => {
        const geometry = feature.getGeometry();
        if (geometry != null && geometry instanceof LineString) {
          const coords = geometry.getCoordinates();
          const rounded = coords.map((coord) => [roundToNearestHalf(coord[0]), roundToNearestHalf(coord[1])]);
          geometry.setCoordinates(rounded);
        }
      });
      addFeaturesToSource("matrikkel", fetchedFeatures);
      return fetchedFeatures;
    } else {
      // Returnerer selv om det er 0 grenser for å vise toast-warning
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

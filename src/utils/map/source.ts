import { Feature } from "ol";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import Geometry from "ol/geom/Geometry";
import VectorLayer from "ol/layer/Vector";
import { optionsFromCapabilities } from "ol/source/WMTS";
import { getLayerById } from "./layers";
import { LayerId } from "hooks/layers/types";
import { GeometryVectorSource } from "hooks/sources/types";

const parser = new WMTSCapabilities();

export const addFeaturesToSource = (
  sourceId: LayerId,
  features: Feature<Geometry>[]
) => {
  const layer = getLayerById(sourceId) as VectorLayer<GeometryVectorSource>;
  const existingSource = layer.getSource();

  // const copiedFeatures = features.map((feature) => feature.clone());

  existingSource.addFeatures(features);
};

export const removeFeaturesFromSource = (
  sourceId: LayerId,
  features: Feature<Geometry>[]
) => {
  const layer = getLayerById(sourceId) as VectorLayer<GeometryVectorSource>;
  const source = layer.getSource();

  const removeFeature = (feature: Feature<Geometry>) => {
    try {
      // console.log(feature);
      source.removeFeature(feature);
    } catch (error) {
      // lmao
      // ikke tryn når vi prøver å fjerne grense som allerede er fjernet
      // dette er en bug, grensen burde ikke ha vært fjernet
    }
  };

  console.log("Removing", features);

  try {
    features.forEach(removeFeature);
  } catch (error) {
    // TODO fiks det her, den thrower når man skal fjerne grenser som ligger inntil andre grenser
    console.error(error);
    // hvis den thrower betyr det bare at featuren ikke finnes, og det går fint
  }
};

export const getWMTSOptions = async (
  capabiltiesUrl: string,
  // parameteret til optionsFromCapabilties er også any, så vi vet ikke typen
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  optionsConfig: any
) => {
  const response = await fetch(capabiltiesUrl);
  const text = await response.text();
  const result = parser.read(text);

  return optionsFromCapabilities(result, optionsConfig);
};
